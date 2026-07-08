use std::{
    fmt::Display,
    ops::{Add, Div, Mul, Neg, Sub},
};

/// z = r*e^(i*theta)
#[derive(Clone, Copy, Debug)]
pub struct ComplexFloat {
    r: f32,
    theta: f32,
}

impl ComplexFloat {
    pub const ZERO: Self = Self { r: 0.0, theta: 0.0 };

    pub fn standard(a: f32, b: f32) -> Self {
        ComplexFloat {
            r: (a * a + b * b).sqrt(),
            theta: b.atan2(a),
        }
    }
    pub fn polar(r: f32, theta: f32) -> Self {
        ComplexFloat { r, theta }
    }

    pub fn a(&self) -> f32 {
        self.r * self.theta.cos()
    }

    pub fn b(&self) -> f32 {
        self.r * self.theta.sin()
    }

    pub fn a_b(&self) -> (f32, f32) {
        let (sin, cos) = self.theta.sin_cos();
        (self.r * cos, self.r * sin)
    }

    pub fn r(&self) -> f32 {
        self.r
    }
    pub fn theta(&self) -> f32 {
        self.theta
    }
}

impl Display for ComplexFloat {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}e^(i{})", self.r, self.theta)
    }
}

impl Add for ComplexFloat {
    type Output = Self;
    fn add(self, rhs: Self) -> Self::Output {
        let (l_a, l_b) = self.a_b();
        let (r_a, r_b) = rhs.a_b();

        ComplexFloat::standard(l_a + r_a, l_b + r_b)
    }
}

impl Neg for ComplexFloat {
    type Output = Self;
    fn neg(self) -> Self::Output {
        ComplexFloat {
            r: -self.r,
            theta: self.theta,
        }
    }
}

impl Sub for ComplexFloat {
    type Output = Self;
    fn sub(self, rhs: Self) -> Self::Output {
        self + -rhs
    }
}

impl Mul for ComplexFloat {
    type Output = Self;
    fn mul(self, rhs: Self) -> Self::Output {
        ComplexFloat {
            r: self.r * rhs.r,
            theta: self.theta + rhs.theta,
        }
    }
}

impl Add<f32> for ComplexFloat {
    type Output = Self;
    fn add(self, rhs: f32) -> Self::Output {
        let (a, b) = self.a_b();
        ComplexFloat::standard(a + rhs, b)
    }
}

impl Sub<f32> for ComplexFloat {
    type Output = Self;
    fn sub(self, rhs: f32) -> Self::Output {
        self + -rhs
    }
}

impl Mul<f32> for ComplexFloat {
    type Output = ComplexFloat;
    fn mul(self, rhs: f32) -> Self::Output {
        ComplexFloat {
            r: self.r * rhs,
            theta: self.theta,
        }
    }
}

impl Div<f32> for ComplexFloat {
    type Output = ComplexFloat;
    fn div(self, rhs: f32) -> Self::Output {
        ComplexFloat {
            r: self.r / rhs,
            theta: self.theta,
        }
    }
}
