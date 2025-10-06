import { SerializeInterceptor } from '@common/interceptors/serialize.interceptor';
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';

const SERIALIZE_TYPE_KEY = 'SerializeTypeKey';

export function getSerializeType(target: any): any {
  return Reflect.getMetadata(SERIALIZE_TYPE_KEY, target);
}

export function setSerializeType(target: any, serializeType: any) {
  Reflect.defineMetadata(SERIALIZE_TYPE_KEY, serializeType, target);
}

const Serialize =
  (entity: any) => (proto: any, propName: any, descriptor: any) => {
    setSerializeType(proto[propName], entity);
    UseInterceptors(ClassSerializerInterceptor)(proto, propName, descriptor);
    UseInterceptors(SerializeInterceptor)(proto, propName, descriptor);
  };

export default Serialize;
