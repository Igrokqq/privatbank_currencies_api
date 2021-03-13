const currenciesConstants = {
  models: {
    currencies: 'currencies',
  },
  endpoints: {
    getAll: 'https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11',
  },
  allowed: ['RUR', 'USD', 'EUR'],
};

export default currenciesConstants;
