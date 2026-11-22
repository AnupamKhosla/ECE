cmake_minimum_required(VERSION 3.16)
project(modbus_snapshot LANGUAGES C)

find_package(PkgConfig REQUIRED)
pkg_check_modules(MODBUS REQUIRED IMPORTED_TARGET libmodbus)
find_package(Threads REQUIRED)

add_executable(modbus_snapshot modbus_snapshot.c)
target_compile_features(modbus_snapshot PRIVATE c_std_11)
target_compile_options(modbus_snapshot PRIVATE -Wall -Wextra -Wpedantic -Werror)
target_link_libraries(modbus_snapshot PRIVATE PkgConfig::MODBUS Threads::Threads)
