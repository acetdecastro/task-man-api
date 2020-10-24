const calculateTip = (total, tipPercent = 0.25) => total + (total * tipPercent);

const fahrenheitToCelcius = (temp) => (temp - 32) / 1.8;

const celciusToFahrenheit = (temp) => (temp * 1.8) + 32;

const add = (a, b) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (a < 0 || b < 0) {
      reject(new Error('Numbers must not be negative.'));
    }

    resolve(a + b);
  }, 1500);
});

module.exports = {
  calculateTip,
  fahrenheitToCelcius,
  celciusToFahrenheit,
  add,
};
