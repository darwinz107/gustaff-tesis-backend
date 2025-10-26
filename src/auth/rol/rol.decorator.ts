import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const Rol = Reflector.createDecorator<string[]>();
