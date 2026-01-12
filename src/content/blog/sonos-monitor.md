---
title: "Building a Sonos Volume Monitor"
description: "Reverse-engineering the Sonos API and building a real-time volume display for a smart speaker."
date: 2025-01-06
tags: ["embedded", "raspberry-pi", "iot", "python"]
---

My family got a new Sonos speaker for the living room TV, and it sounds fantastic. But there was one annoying problem - **no volume feedback**. No lights, no display, nothing. You'd adjust the volume and hope it was at the right level. I decided to build a solution: a small display monitor that shows the current volume in real-time.

## The Problem

The Sonos Arc is a premium speaker, but the lack of visual feedback for volume is surprisingly frustrating. After some research, I discovered that Sonos devices expose a **UPnP API** that you can query to get the current volume and mute state. This was perfect - I could build a simple monitor without needing to reverse-engineer any proprietary protocols.

## The Hardware

This was a surprisingly affordable project:

- **Raspberry Pi Pico W** (~$6) - Microcontroller with built-in WiFi
- **0.96" OLED Display** (~$5) - SSD1306, I2C interface
- **1.3" OLED Display** (~$8) - Upgraded later for better visibility
- **Push Button** (~$0.50) - Manual reinit trigger
- **Resistors & Header Pins** (~$1) - For button debouncing and connections
- **3D Printed Enclosure** - Custom case design
- **Micro USB Cable** - For power

Total cost: ~$21 for the initial prototype, plus the upgraded screen.

### Why the Pico W?

The Pico W has WiFi built-in, making it perfect for IoT projects. The only alternative would be adding a separate WiFi module, which adds complexity and cost. Plus, it's tiny - easy to hide behind the TV.

## Hardware Setup

![Sonos monitor components laid out](../../assets/blog/image-placeholder-components.jpg)

The wiring is straightforward:

```
Pico W:
- GPIO 0 (SDA) → OLED SDA
- GPIO 1 (SCL) → OLED SCL
- GPIO 2 → Button (with pull-up resistor)
- 3V3 → OLED VCC, Button VCC
- GND → OLED GND, Button GND (through 10kΩ pull-up)
```

I2C was the obvious choice - only two wires needed for the display, and the Pico handles it natively.

## The Software Challenge

The initial version was simple: query the Sonos API every second and update the display if the volume changed. But as I added features, things got complicated.

### Features Added

1. **Volume Display** - Show the current volume as large digits
2. **Mute Indicator** - Different screen when muted
3. **Time Display** - Show the time periodically
4. **Auto-Dim** - Dim the screen after 30 seconds of no changes
5. **Manual Reinit Button** - Force WiFi/time sync

### The Freezing Problem

After running for a couple hours, the display would just go blank. No error messages, no reboot - it would just **hang indefinitely**. The Pico was stuck in some infinite loop, probably in the socket code or time sync logic.

Debugging embedded systems without a serial console is painful. I initially tried adding better error handling, but the real culprit was subtle timing issues:

- The NTP socket would sometimes hang waiting for a response
- The SOAP request parsing could block if the network was slow
- Time.sleep() could get interrupted in weird ways

**The Solution**: Implement a **watchdog timer** that resets the device if it gets stuck. Additionally, I added an **auto-reinit function** that restarts WiFi and NTP every 5 minutes. This ensures the system stays responsive and any transient network issues are cleaned up automatically.

## The Display Evolution

The first 0.96" display worked, but it was too small to read comfortably from across the room. When the 1.3" arrived, it made a huge difference. But this taught me an important lesson: **always measure twice when dealing with displays**.

![Failed 3D printed case designs](../../assets/blog/image-placeholder-failed-cases.jpg)

I went through several iterations of 3D printed cases:
- First design was too tight - the header pins wouldn't fit
- Second design didn't account for the larger display
- Third design had thermal issues - the OLED could overheat
- Final design included proper ventilation and a clean cutout

## The Code Structure

Here's the main loop logic:

```python
# Main polling cycle
while True:
    # Feed watchdog to prevent reset
    if wdt:
        wdt.feed()
    
    # Periodic garbage collection
    if (now - last_gc_time) > GC_INTERVAL:
        gc.collect()
        last_gc_time = now
    
    # Get current volume and mute state
    vol = get_volume(SONOS_IP)
    mute = get_mute(SONOS_IP)
    
    # Check for changes
    if vol != last_vol or mute != last_mute:
        last_vol = vol
        last_mute = mute
        last_change_time = now
        show_speaker_state(vol, mute)
        set_bright()
    
    # Show time periodically (every 60 seconds)
    elif (now - last_time_shown) > TIME_DISPLAY_INTERVAL:
        showing_time = True
        show_time()
    
    # Dim after 30 seconds of no activity
    elif not is_dimmed and (now - last_change_time) > DIM_AFTER_SECONDS:
        set_dim()
    
    time.sleep(0.5)
```

### Querying the Sonos API

The Sonos API uses SOAP (XML-based RPC). Here's the volume query:

```python
def get_volume(ip):
    """Get current volume from Sonos using SOAP/UPnP"""
    sock = None
    try:
        body = SOAP_VOLUME.format(SERVICE_TYPE)
        request = (
            "POST /MediaRenderer/RenderingControl/Control HTTP/1.1\r\n"
            "Host: {}:1400\r\n"
            "Content-Type: text/xml; charset=\"utf-8\"\r\n"
            "SOAPACTION: \"{}#GetVolume\"\r\n"
            "Content-Length: {}\r\n\r\n{}"
        ).format(ip, SERVICE_TYPE, len(body), body)
        
        sock = socket.socket()
        sock.settimeout(2)
        sock.connect((ip, 1400))
        sock.send(request.encode())
        
        # Receive response with limited retries
        data = b""
        sock.settimeout(1)
        for _ in range(20):
            try:
                chunk = sock.recv(512)
                if not chunk:
                    break
                data += chunk
                if b"</s:Envelope>" in data:
                    break
            except:
                break
        
        # Parse XML response
        text = data.decode("utf-8", "ignore")
        start = text.find("<CurrentVolume>")
        if start == -1:
            return None
        end = text.find("</CurrentVolume>", start)
        vol = int(text[start + 15:end])
        return vol // 2  # Sonos volume is 0-100, display as 0-50
    except Exception as e:
        print("Volume error:", e)
        return None
    finally:
        if sock:
            try:
                sock.close()
            except:
                pass
```

### Display Rendering

The big digit rendering is pure pixel manipulation:

```python
DIGITS = {
    "0": [0x3E, 0x51, 0x49, 0x45, 0x3E],
    "1": [0x00, 0x42, 0x7F, 0x40, 0x00],
    "2": [0x42, 0x61, 0x51, 0x49, 0x46],
    # ... etc
}

def draw_big_digit(x, y, digit, scale):
    """Draw a digit scaled up for readability"""
    bitmap = DIGITS[digit]
    for col, bits in enumerate(bitmap):
        for row in range(7):
            if bits & (1 << row):
                oled.fill_rect(x + col * scale, y + row * scale, scale, scale, 1)

def show_volume(vol):
    """Display volume number centered on screen"""
    oled.fill(0)
    vol_str = str(vol)
    scale = 6
    digit_w = 5 * scale
    total_w = len(vol_str) * digit_w + (len(vol_str) - 1) * scale
    start_x = (128 - total_w) // 2
    start_y = (64 - (7 * scale)) // 2
    
    for i, ch in enumerate(vol_str):
        draw_big_digit(start_x + i * (digit_w + scale), start_y, ch, scale)
    
    oled.show()
```

## Final Result

![Completed Sonos monitor installed under TV](../../assets/blog/image-placeholder-final-installed.jpg)

The monitor sits in a small 3D-printed case directly under the TV. It updates in real-time when you adjust the volume, shows the time every minute, and dims automatically to reduce light pollution at night.

**Lessons learned:**
- **Always include a watchdog timer** on long-running embedded systems
- **Test with realistic network conditions** - simulation != reality
- **Periodic reinits are a valid band-aid** when debugging is hard
- **Visible feedback matters** - my family actually uses it daily
- **UPnP is surprisingly accessible** - no proprietary reverse-engineering needed

The project cost under $30 and solved a real problem. It's running reliably for weeks at a time now, which is good enough for me.

