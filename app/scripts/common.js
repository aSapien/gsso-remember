console.log('Loading Commons script');
// -=-=-=-Option type definition=-=-=-=-

const Option = x => (x === undefined || x === null) ? None : Some(x);

const Some = x => ({
  map: f => Some(f(x)),
  flatMap: f => f(x),
  fold: (ifEmpty, f) => f(x)
});

const None = {
  map: f => None,
  flatMap: f => None,
  fold: (ifEmpty, f) => ifEmpty()
};

if (window !== undefined) {
    window.Some = Some;
    window.None = None;
    window.Option = Option;
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
