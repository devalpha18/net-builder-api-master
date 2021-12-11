import { Repository } from 'typeorm';

export function getFromDto<T>(dto: any, data: any, fields?: string[]): T {
  let properties: string[] = [];

  if (fields && fields.length) {
    properties = fields;
  } else {
    properties = Object.keys(dto);
  }
  properties.forEach((property) => {
    data[property] = dto[property];
  });
  return data;
}

export function saveDtoToRepository<T>(
  dto: any,
  data: any,
  repository: Repository<T>,
  fields?: string[],
): Promise<T> {
  const obj = getFromDto<T>(dto, data, fields);
  return repository.save(obj);
}

export function softDeleteFromRepository<T>(
  payload: any,
  repository: Repository<T>,
): Promise<T> {
  return repository.save({
    ...payload,
    isDeleted: true,
    deletedAt: new Date().toISOString(),
  });
}
