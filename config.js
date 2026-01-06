const decode = (str) => {
    try {
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (e) {
        console.error("Decode error", e);
        return "";
    }
};

const _E_URL = "aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J4dVVETFJFNFNWOEQ5bHgwTVVQMnQ3bDVXMW1hLWg1VFhTZllFdkZjX0ppdi1zVmljOVcxZkJ3bW96Vy1mOVpDeHgvZXhlYw==";
const _E_KEY = "TVlfU1VQRVJfU0VDUkVUX0tFWV8yMDI2";

const CONFIG = {
    API_URL: decode(_E_URL),
    API_SECRET: decode(_E_KEY)
};

const COLORS = {
    primary: '#0d6efd',
    red: '#ed3738',
    orange: '#ff914d',
    grey: '#737373',
    blue: '#007ef1',
    background: '#f8f9fa'
};