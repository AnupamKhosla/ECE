#include <chrono>
#include <iomanip>
#include <iostream>
#include <string_view>

#include <rmf_traffic/DetectConflict.hpp>
#include <rmf_traffic/Profile.hpp>
#include <rmf_traffic/Trajectory.hpp>
#include <rmf_traffic/geometry/Circle.hpp>

using Milliseconds = std::chrono::milliseconds;
using rmf_traffic::Profile;
using rmf_traffic::Time;
using rmf_traffic::Trajectory;

const Time origin{};

static Profile disk(double radius)
{
    return Profile{rmf_traffic::geometry::make_final_convex<
        rmf_traffic::geometry::Circle>(radius)};
}

static Trajectory straight(Eigen::Vector3d entry, Eigen::Vector3d exit, int start_ms)
{
    Trajectory trajectory;
    const Time start = origin + Milliseconds{start_ms};
    const Eigen::Vector3d velocity = (exit - entry) / 6.0;
    trajectory.insert(start, entry, velocity);
    trajectory.insert(start + std::chrono::seconds{6}, exit, velocity);
    return trajectory;
}

static Trajectory eastbound(int start_ms)
{
    return straight({-3.0, 0.0, 0.0}, {3.0, 0.0, 0.0}, start_ms);
}

static Trajectory northbound(int start_ms)
{
    constexpr double north = 1.5707963267948966;
    return straight({0.0, -3.0, north}, {0.0, 3.0, north}, start_ms);
}

static Trajectory stopped_after_link_loss()
{
    Trajectory trajectory;
    const Eigen::Vector3d last_position{0.2, 0.0, 0.0};
    trajectory.insert(origin + Milliseconds{3200}, last_position, Eigen::Vector3d::Zero());
    trajectory.insert(origin + Milliseconds{9000}, last_position, Eigen::Vector3d::Zero());
    return trajectory;
}

static bool report(std::string_view name, const Trajectory& a, double radius_a,
                   const Trajectory& b, double radius_b, bool expect_conflict)
{
    const auto conflict = rmf_traffic::DetectConflict::between(
        disk(radius_a), a, nullptr, disk(radius_b), b, nullptr);
    auto seconds = [](Time time) {
        return std::chrono::duration<double>{time - origin}.count();
    };

    std::cout << name << ',' << seconds(*a.start_time()) << ','
              << seconds(*b.start_time()) << ',' << radius_a << ',' << radius_b
              << ',' << (conflict ? "conflict" : "clear") << ',';
    if (conflict) {
        std::cout << seconds(conflict->time);
    }
    std::cout << '\n';
    return conflict.has_value() == expect_conflict;
}

int main()
{
    std::cout << std::fixed << std::setprecision(6);
    std::cout << "case,a_start_s,b_start_s,a_radius_m,b_radius_m,result,first_conflict_s\n";
    bool valid = report("same_crossing_time", eastbound(0), 0.32, northbound(0), 0.30, true);
    valid &= report("empty_plan", eastbound(0), 0.32, northbound(1200), 0.30, false);
    valid &= report("load_same_plan", eastbound(0), 0.56, northbound(1200), 0.40, true);
    valid &= report("a_falls_behind", eastbound(600), 0.32, northbound(1200), 0.30, true);
    valid &= report("load_b_delayed", eastbound(0), 0.56, northbound(1600), 0.40, false);
    valid &= report("lost_link_a_still_there", stopped_after_link_loss(), 0.56,
                    northbound(1600), 0.40, true);
    if (!valid) {
        std::cerr << "One or more fixtures returned an unexpected conflict decision.\n";
        return 1;
    }
    return 0;
}
