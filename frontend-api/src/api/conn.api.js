import axios from 'axios'

export const Getconn = () => {
    return axios.get('http://localhost:8000/api/v1/Users')
}