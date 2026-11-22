#ifndef LAB_FREERTOS_CONFIG_H
#define LAB_FREERTOS_CONFIG_H

#include <stdlib.h>

#define configNUMBER_OF_CORES                    1
#define configUSE_PREEMPTION                     1
#define configUSE_TIME_SLICING                   1
#define configUSE_PORT_OPTIMISED_TASK_SELECTION   0
#define configTICK_RATE_HZ                       1000
#define configTICK_TYPE_WIDTH_IN_BITS            TICK_TYPE_WIDTH_32_BITS
#define configMAX_PRIORITIES                     5
#define configMINIMAL_STACK_SIZE                 256
#define configTOTAL_HEAP_SIZE                    (128 * 1024)
#define configUSE_IDLE_HOOK                      0
#define configUSE_TICK_HOOK                      0
#define configUSE_MUTEXES                        1
#define configUSE_RECURSIVE_MUTEXES              0
#define configUSE_COUNTING_SEMAPHORES            0
#define configUSE_TASK_NOTIFICATIONS            1
#define configSUPPORT_DYNAMIC_ALLOCATION        1
#define configSUPPORT_STATIC_ALLOCATION         0
#define INCLUDE_vTaskDelete                     1
#define INCLUDE_vTaskSuspend                    1
#define INCLUDE_uxTaskPriorityGet               1
#define configASSERT(condition)                 do { if (!(condition)) abort(); } while (0)

#endif
