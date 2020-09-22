const totalSum = (input) => {
  return input.reduce((ASF, value) =>
    ASF + value.reduce((acc, value2) => {
      return acc + value2, 0})
  , 0);
};