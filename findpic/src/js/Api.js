export default class Api {
  constructor() { }

  get({ query, page = 1, perPage = 12 }) {
    const url = `https://pixabay.com/api/?image_type=photo&q=${query}&per_page=${perPage}&page=${page}&key=${Api.KEY}`;
    return fetch(url)
      .then(response => {
        return response.json();
      })
      .then(data => data.hits)
      .catch(err => console.error(err));
  }
}

Api.KEY = "9968633-69c1320fae33e8ec0bca60a09";