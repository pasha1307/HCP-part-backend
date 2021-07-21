import Cors from 'cors'

// Initializing the cors middleware
const cors = Cors({
    methods: ['GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result)
            }

            return resolve(result)
        })
    })
}

async function handler(req, res) {
    // Run the middleware
    await runMiddleware(req, res, cors)

    // Rest of the API logic
    const q = `
query ($page: Int, $perPage: Int) {
  Page (page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media (type: ANIME) {
        title {
            english
        }
        description
        coverImage {
            extraLarge
            large
            medium
            color
        }
    }
  }
}`;

    const variables = {
        page: 1,
        perPage: 10
    };
    const url = process.env.apiUrl;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: q,
            variables: variables
        })
    };
    return fetch(url, options)
        .then(resp => {
            return resp.json().then(function (json) {
                return resp.ok ? json : Promise.reject(json);
            })
        })
        .then(data => {
            console.log('DATA', data);
            res.send(data)
        } )
        .catch(err => console.log(err));
}

export default handler
