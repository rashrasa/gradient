use std::{
    fmt::Display,
    ops::{Add, Mul, Sub},
};

/// z = a + bi
#[derive(Clone, Copy, Debug)]
pub struct ComplexFloat {
    a: f32,
    b: f32,
}

impl ComplexFloat {
    pub fn standard(a: f32, b: f32) -> Self {
        ComplexFloat { a, b }
    }
    pub fn polar(r: f32, theta: f32) -> Self {
        ComplexFloat {
            a: r * theta.cos(),
            b: r * theta.sin(),
        }
    }

    pub fn a(&self) -> f32 {
        self.a
    }

    pub fn b(&self) -> f32 {
        self.b
    }

    pub fn r(&self) -> f32 {
        (self.a * self.a + self.b * self.b).sqrt()
    }
    pub fn theta(&self) -> f32 {
        self.b.atan2(self.a)
    }
}

impl Display for ComplexFloat {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{} + {}i", self.a, self.b)
    }
}

impl Add for ComplexFloat {
    type Output = Self;
    fn add(self, rhs: Self) -> Self::Output {
        ComplexFloat {
            a: self.a + rhs.a,
            b: self.b + rhs.b,
        }
    }
}

impl Sub for ComplexFloat {
    type Output = Self;
    fn sub(self, rhs: Self) -> Self::Output {
        ComplexFloat {
            a: self.a - rhs.a,
            b: self.b - rhs.b,
        }
    }
}

impl Mul for ComplexFloat {
    type Output = Self;
    fn mul(self, rhs: Self) -> Self::Output {
        ComplexFloat {
            a: self.a * rhs.a - self.b * rhs.b,
            b: self.b * rhs.a + self.a * rhs.b,
        }
    }
}

impl Add<f32> for ComplexFloat {
    type Output = Self;
    fn add(self, rhs: f32) -> Self::Output {
        ComplexFloat {
            a: self.a + rhs,
            b: self.b,
        }
    }
}

impl Sub<f32> for ComplexFloat {
    type Output = Self;
    fn sub(self, rhs: f32) -> Self::Output {
        ComplexFloat {
            a: self.a - rhs,
            b: self.b,
        }
    }
}

impl Mul<f32> for ComplexFloat {
    type Output = ComplexFloat;
    fn mul(self, rhs: f32) -> Self::Output {
        ComplexFloat {
            a: self.a * rhs,
            b: self.b * rhs,
        }
    }
}
