cmake_minimum_required(VERSION 3.16)
project(robot_task_latency LANGUAGES C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(FREERTOS_KERNEL "" CACHE PATH "Path to the unpacked FreeRTOS-Kernel source")
if(NOT EXISTS "${FREERTOS_KERNEL}/tasks.c")
    message(FATAL_ERROR "Set FREERTOS_KERNEL to FreeRTOS-Kernel V11.2.0")
endif()

add_library(freertos_config INTERFACE)
target_include_directories(freertos_config SYSTEM INTERFACE "${CMAKE_CURRENT_SOURCE_DIR}")
set(FREERTOS_PORT GCC_POSIX)
set(FREERTOS_HEAP 4)
add_subdirectory("${FREERTOS_KERNEL}" freertos-kernel)

add_executable(robot_task_latency robot_task_latency.c)
target_link_libraries(robot_task_latency PRIVATE freertos_kernel)
target_compile_options(robot_task_latency PRIVATE -Wall -Wextra -Wpedantic -Werror)
