cmake_minimum_required(VERSION 3.16)
project(rmf_crossing LANGUAGES CXX)

find_package(rmf_traffic CONFIG REQUIRED)

add_executable(rmf_crossing rmf_crossing.cpp)
target_compile_features(rmf_crossing PRIVATE cxx_std_17)
target_compile_options(rmf_crossing PRIVATE -Wall -Wextra -Wpedantic -Werror)
target_link_libraries(rmf_crossing PRIVATE rmf_traffic::rmf_traffic)
