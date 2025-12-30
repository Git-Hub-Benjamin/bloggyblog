---
title: "Understanding pointers in C"
description: "Breaking down C pointers - what they are, why they matter, and common patterns."
date: 2024-12-25
tags: ["c", "programming", "fundamentals"]
---

Pointers clicked for me when I stopped thinking of them as "hard" and started thinking of them as just... addresses. That's it. An address in memory.

## What is a pointer?

A pointer is a variable that holds a memory address. That's the whole thing.

```c
int x = 42;      // x holds the value 42
int *p = &x;     // p holds the ADDRESS of x
```

When we say `int *p`, we're saying "p is a variable that will hold the address of an int".

## The operators

Two operators to remember:

- `&` - "address of" - gives you the address of a variable
- `*` - "dereference" - gives you the value at an address

```c
int x = 42;
int *p = &x;     // p = address of x

printf("%p\n", p);   // prints the address (something like 0x7ffd5e8c3a4c)
printf("%d\n", *p);  // prints 42 (the value AT that address)
```

## Why do we need them?

### 1. Modifying variables in functions

Without pointers, C passes everything by value:

```c
void cant_modify(int x) {
    x = 100;  // This only modifies the local copy
}

void can_modify(int *x) {
    *x = 100;  // This modifies the original
}

int main() {
    int num = 42;
    cant_modify(num);
    printf("%d\n", num);  // Still 42
    
    can_modify(&num);
    printf("%d\n", num);  // Now 100
}
```

### 2. Dynamic memory

```c
int *arr = malloc(10 * sizeof(int));  // Allocate array of 10 ints
// use arr...
free(arr);  // Don't forget to free!
```

### 3. Efficient data passing

Passing a large struct by value copies the whole thing. Passing a pointer just copies 8 bytes (on 64-bit systems).

```c
void process_data(struct BigData *data) {
    // Only the pointer (8 bytes) is copied, not the whole struct
}
```

## Arrays and pointers

Arrays and pointers are closely related. An array name "decays" to a pointer to its first element:

```c
int arr[5] = {1, 2, 3, 4, 5};

int *p = arr;        // p points to arr[0]
printf("%d\n", *p);       // 1
printf("%d\n", *(p+1));   // 2
printf("%d\n", p[2]);     // 3 (yes, this works!)
```

## Common gotchas

### Uninitialized pointers

```c
int *p;        // p contains garbage - could point anywhere!
*p = 42;       // UNDEFINED BEHAVIOR - might crash, might corrupt memory
```

Always initialize pointers:

```c
int *p = NULL;  // Safe - dereferencing NULL will crash predictably
```

### Memory leaks

```c
void leak() {
    int *p = malloc(sizeof(int));
    // forgot to free(p)!
}  // Memory is leaked when function returns
```

### Dangling pointers

```c
int *p;
{
    int x = 42;
    p = &x;
}
// x is out of scope, p now points to invalid memory
*p = 10;  // UNDEFINED BEHAVIOR
```

## Wrapping up

Pointers are just addresses. Once that clicks, everything else follows. The syntax is a bit weird, but the concept is simple.

Practice by writing small programs that manipulate memory directly. Embedded programming is great for this - you're constantly dealing with memory-mapped registers, which are basically pointers to hardware.
