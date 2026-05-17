import request from 'supertest';
import { app } from '../index';

describe('GET /', () => {
  it('should_return_200_when_root_endpoint_is_called', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hola LTI!');
  });
});
