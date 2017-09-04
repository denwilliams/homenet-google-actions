const config = {
  homenetUrl: 'http://localhost:3210'
};

exports.get = (key) => {
  return config[key];
};
