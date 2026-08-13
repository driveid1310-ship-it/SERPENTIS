interface EnvConfig {
  API_BASE_URL: string;
}

const ENV: Record<'development' | 'production', EnvConfig> = {
  development: {
    API_BASE_URL: 'http://10.0.2.2:5000/api',
  },
  production: {
    API_BASE_URL: 'https://example.com/api',
  },
};

const currentEnv: EnvConfig = __DEV__ ? ENV.development : ENV.production;

export const API_BASE_URL = currentEnv.API_BASE_URL;

export default currentEnv;
