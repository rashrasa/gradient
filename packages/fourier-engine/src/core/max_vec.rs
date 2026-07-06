use std::cmp::Ordering;

/// Simply allows iterating over a list of T
/// in sorted order efficiently while keeping the
/// original ordering accessible.
///
/// It does this by maintaining a set of indexes for
/// the original ordering while storing the list in
/// sorted order.
///
/// It's less efficient to access the original ordering
/// due to the need to index into arbitrary parts of the array
/// which isn't optimal for cache locality.
/// It's assumed that the sorted order is needed most frequently.
///
/// This requires a sort_by closure to avoid introducing
/// an Ord trait bound on T (mainly to allow storing floats).
#[derive(Debug, Clone)]
pub struct MaxVec<T>
where
    T: Sized,
{
    sorted: Vec<T>,
    original: Vec<usize>,
}

impl<T> MaxVec<T>
where
    T: Sized,
{
    pub fn new<F>(data: Vec<T>, mut sort_by: F) -> Self
    where
        F: FnMut(&T, &T) -> Ordering,
    {
        let mut enumerated: Vec<(usize, T)> = data.into_iter().enumerate().collect();
        enumerated.sort_by(|(_, a), (_, b)| sort_by(a, b));

        let n = enumerated.len();

        let mut original: Vec<usize> = vec![0; n];
        let mut sorted: Vec<T> = Vec::with_capacity(n);

        for (i, (original_index, data)) in enumerated.into_iter().enumerate() {
            sorted.push(data);
            original[original_index] = i;
        }

        Self { original, sorted }
    }

    pub fn original(&self) -> Original<'_, T> {
        Original {
            values: &self.sorted,
            indexes: self.original.iter(),
        }
    }

    pub fn sorted(&self) -> Sorted<'_, T> {
        Sorted {
            inner: self.sorted.iter(),
            length: self.sorted.len(),
        }
    }
}

pub struct Original<'a, T> {
    indexes: std::slice::Iter<'a, usize>,
    values: &'a [T],
}

impl<T> Original<'_, T> {
    pub fn len(&self) -> usize {
        self.values.len()
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }
}

impl<'a, T> Iterator for Original<'a, T>
where
    T: Sized,
{
    type Item = &'a T;

    fn next(&mut self) -> Option<Self::Item> {
        self.indexes
            .next()
            .map(|idx| self.values.get(*idx).unwrap())
    }
}

impl<T> Sorted<'_, T> {
    pub fn len(&self) -> usize {
        self.length
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }
}

pub struct Sorted<'a, T> {
    inner: std::slice::Iter<'a, T>,
    length: usize,
}
impl<'a, T> Iterator for Sorted<'a, T>
where
    T: Sized,
{
    type Item = &'a T;

    fn next(&mut self) -> Option<Self::Item> {
        self.inner.next()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn iterators_yield_expected_values() {
        let sort_by: fn(&i32, &i32) -> Ordering = |a, b| a.cmp(b);
        let source = vec![1, 574, 7, 13, 8, -423];
        let mut sorted = source.clone();
        sorted.sort_by(sort_by);

        let mv = MaxVec::new(source.clone(), sort_by);
        for (i, e) in mv.original().enumerate() {
            assert_eq!(source[i], *e);
        }
        for (i, e) in mv.sorted().enumerate() {
            assert_eq!(sorted[i], *e);
        }
    }
}
