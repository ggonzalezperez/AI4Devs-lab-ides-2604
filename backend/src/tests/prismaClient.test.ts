jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({ _isMockClient: true })),
}));

describe('getPrismaClient singleton', () => {
  it('should_return_a_defined_client_instance', async () => {
    jest.resetModules();
    const { getPrismaClient } = await import('../infrastructure/prismaClient');
    const client = getPrismaClient();
    expect(client).toBeDefined();
  });

  it('should_return_the_same_instance_on_repeated_calls', async () => {
    jest.resetModules();
    const { getPrismaClient } = await import('../infrastructure/prismaClient');
    const first = getPrismaClient();
    const second = getPrismaClient();
    expect(first).toBe(second);
  });
});
