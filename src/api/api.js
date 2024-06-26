import axios from "axios";

const instance = axios.create({
    baseURL: "https://api.kinopoisk.dev/v1.4",
    headers: {
        accept: "application/json",
        "X-API-KEY": `${process.env.REACT_APP_API_KEY}`,
    },
});

const instance2 = axios.create({
    baseURL: "https://api.kinopoisk.dev/v1",
    headers: {
        accept: "application/json",
        "X-API-KEY": `${process.env.REACT_APP_API_KEY}`,
    },
});

/**
 * @param {number} page
 * @param {number} limit
 * @param {string?} name
 */
export async function getMoviesByName(page, limit, name) {
    try {
        let url = `movie/search?page=${page}&limit=${limit}`;

        if (name) {
            url += `&query=${name}`;
        }
        const response = await instance.get(url);

        return [response.data.docs.map(_transformMovies), response.data.total];
    } catch (error) {
        throw error;
    }
}

export async function getMoviesByFilters(page, limit, country, age, year) {
    try {
        let url = `movie?page=${page}&limit=${limit}`;

        if (year) {
            url += `&year=${year}`;
        }
        if (country) {
            url += `&countries.name=${country}`;
        }
        if (age) {
            url += `&ageRating=${age}`;
        }

        const response = await instance.get(url);

        return [response.data.docs.map(_transformMovies), response.data.total];
    } catch (error) {
        throw error;
    }
}

export async function getMoviePosters(id) {
    try {
        const response = await instance.get(
            `image?page=1&limit=10&movieId=${id}`
        );

        return response.data.docs.map(_transformMoviePosters);
    } catch (error) {
        throw error;
    }
}

const _transformMoviePosters = posters => {
    return {
        link: posters.previewUrl,
    };
};

export async function getMovie(id) {
    try {
        const response = await instance.get(`movie/${id}`);
        return _transformMovie(response.data);
    } catch (error) {
        throw error;
    }
}

export async function getMovieReviews(id, page = 1, size = 3) {
    try {
        const response = await instance.get(
            `review?page=${page}&limit=${size}&selectFields=&movieId=${id}`
        );
        return response.data.docs.map(_transformMovieReviews);
    } catch (error) {
        throw error;
    }
}

export async function getMovieSeriesInformation(id, page = 1, size = 3) {
    try {
        const response = await instance.get(
            `season?page=${page}&limit=${size}&sortField=enName&sortType=1&movieId=${id}`
        );
        return response.data.docs.map(_transformMovieSeriesInformation);
    } catch (error) {
        throw error;
    }
}

const _transformMovieSeriesInformation = serias => {
    return {
        movieId: serias.movieId,
        name: serias.name,
        episodesCount: serias.episodesCount,
        episodes: serias.episodes,
        enName: serias.enName,
    };
};

export async function getCountries() {
    try {
        const response = await instance2.get(
            `movie/possible-values-by-field?field=countries.name`
        );

        return response.data.map(_transformCountries);
    } catch (error) {
        console.error(error);
    }
}

export async function getGenres() {
    try {
        const response = await instance2.get(
            `movie/possible-values-by-field?field=genres.name`
        );

        return response.data.map(_transformGenres);
    } catch (error) {
        console.error(error);
    }
}

const _transformGenres = genres => {
    return {
        name: genres.name,
    };
};

export async function getTypesMovie() {
    try {
        const response = await instance2.get(
            `movie/possible-values-by-field?field=type`
        );

        return response.data.map(_transformTypes);
    } catch (error) {
        console.error(error);
    }
}

const _transformTypes = types => {
    return {
        name: types.name,
    };
};

export async function getRandomMovie(
    type,
    year,
    rating,
    genre,
    country,
    networks
) {
    try {
        let url = "movie/random";
        const params = new URLSearchParams();

        if (type?.length) {
            type.forEach(t => {
                params.append("type", t);
            });
        }
        if (year) {
            params.append("year", year);
        }
        if (rating) {
            params.append("rating.kp", rating);
        }
        if (genre?.length) {
            genre.forEach(g => {
                params.append("genres.name", g);
            });
        }
        if (country) {
            params.append("countries.name", country);
        }
        if (networks?.length) {
            networks.forEach(n => {
                params.append("networks.items.name", n);
            });
        }

        url += `?${params.toString()}`;

        const response = await instance.get(url);

        return response.data?.id;
    } catch (error) {
        console.error(error);
    }
}

export async function getNetworks(title) {
    try {
        let url = "studio?page=1&limit=10";

        if (title) {
            url += `&title=${title}`;
        }

        const response = await instance.get(url);

        return response.data.docs;
    } catch (error) {
        console.error(error);
    }
}

const _transformMovies = movies => {
    return {
        id: movies.id,
        name: movies.name || movies.alternativeName || "Нет никакой информации",
        poster: movies.poster.previewUrl,
        year: movies.year,
        description: movies.description,
        genres: movies.genres,
        type: movies.type,
        ageRating: movies.ageRating,
        countries: movies.countries,
    };
};

const _transformMovie = movie => {
    return {
        ...movie,
        name: movie.name || movie.alternativeName,
        poster: movie.poster.url,
        description: movie.description || "Нет никакой информации",
        rating: movie.rating.imdb,
        actors: movie.persons,
    };
};

const _transformMovieReviews = rewies => {
    return {
        title: rewies.title,
        type: rewies.type,
        review: rewies.review,
        date: rewies.date,
        author: rewies.author,
    };
};

const _transformCountries = countries => {
    return {
        name: countries.name,
    };
};
