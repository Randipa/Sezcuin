import 'reflect-metadata';

import serverlessExpress from '@vendia/serverless-express';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Context,
} from 'aws-lambda';
import express from 'express';
import { createNestApp } from './app.factory';

type ApiHandler = (
  event: APIGatewayProxyEventV2,
  context: Context,
) => Promise<APIGatewayProxyResultV2>;

let cachedHandler: ApiHandler | undefined;

async function bootstrap(): Promise<ApiHandler> {
  const expressApp = express();
  await createNestApp(expressApp);
  return serverlessExpress({ app: expressApp }) as unknown as ApiHandler;
}

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResultV2> => {
  context.callbackWaitsForEmptyEventLoop = false;
  cachedHandler ??= await bootstrap();
  return cachedHandler(event, context);
};
