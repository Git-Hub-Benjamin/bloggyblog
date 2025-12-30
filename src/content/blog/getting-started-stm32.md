---
title: "Getting started with STM32"
description: "My first steps with the STM32 microcontroller family - setup, toolchain, and blinking an LED."
date: 2024-12-28
tags: ["embedded", "stm32", "c"]
---

I've been wanting to move beyond Arduino and get into "real" embedded development. The STM32 family seemed like a good next step - they're powerful, well-documented, and used in actual products.

## The hardware

I picked up an **STM32F401 Nucleo board**. It's cheap (~$15), has a built-in debugger, and the F401 chip is capable enough for learning without being overwhelming.

Specs that matter:
- ARM Cortex-M4 @ 84MHz
- 512KB Flash, 96KB RAM
- Tons of peripherals (SPI, I2C, UART, ADC, timers...)

## Setting up the toolchain

The hardest part of embedded development is always the toolchain setup. Here's what I'm using:

### Compiler: ARM GCC

```bash
# On Ubuntu/Debian
sudo apt install gcc-arm-none-eabi

# Verify installation
arm-none-eabi-gcc --version
```

### Debugger: OpenOCD

```bash
sudo apt install openocd
```

### Build system: Make

Keeping it simple with Makefiles. No IDE dependency.

## The classic blink

Every embedded journey starts with blinking an LED. Here's the bare-metal version:

```c
#include "stm32f4xx.h"

int main(void) {
    // Enable GPIOA clock
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
    
    // Configure PA5 as output (LED on Nucleo board)
    GPIOA->MODER |= GPIO_MODER_MODER5_0;
    
    while (1) {
        GPIOA->ODR ^= GPIO_ODR_OD5;  // Toggle LED
        
        // Crude delay
        for (volatile int i = 0; i < 100000; i++);
    }
}
```

No HAL, no libraries - just direct register manipulation. It's verbose but you understand exactly what's happening.

## What's next

- Proper delay using SysTick timer
- UART for debugging output
- Interrupt-driven GPIO

The learning curve is steep but it's satisfying to understand what's actually happening at the hardware level.
