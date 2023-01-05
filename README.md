# UMH Datasource v2

## What is UMH Datasource v2?

UMH Datasource v2 is a new version of the UMH Datasource, providing easier access to the data and a more user-friendly
interface.

## Getting started

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   yarn dev
   ```

   or

   ```bash
   yarn watch
   ```

3. Test with Docker

   ```bash
   docker run -d -p 3000:3000 -v <path-to-source>:/var/lib/grafana/plugins -e GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=umh-v2-datasource grafana/grafana
   ```

4. Build plugin in production mode

   ```bash
   yarn build
   ```
