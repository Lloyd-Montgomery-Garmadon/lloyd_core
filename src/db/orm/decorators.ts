import 'reflect-metadata';

export function Table(name: string) {
    return function (target: Function) {
        Reflect.defineMetadata('tableName', name, target);
    };
}

export function Column(columnName?: string) {
    return function (target: any, propertyKey: string) {
        const columns = Reflect.getMetadata('columns', target.constructor) || [];
        columns.push({ property: propertyKey, column: columnName || propertyKey });
        Reflect.defineMetadata('columns', columns, target.constructor);
    };
}
