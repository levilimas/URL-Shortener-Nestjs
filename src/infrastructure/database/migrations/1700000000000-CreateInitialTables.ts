import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateInitialTables1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'urls',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'originalUrl',
            type: 'text',
          },
          {
            name: 'shortCode',
            type: 'varchar',
            length: '10',
            isUnique: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'maxClicks',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'clickCount',
            type: 'integer',
            default: 0,
          },
          {
            name: 'qrCode',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'analytics',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'urlId',
            type: 'uuid',
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '45',
          },
          {
            name: 'userAgent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'referer',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '2',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'device',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'browser',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'os',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'utmSource',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'utmMedium',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'utmCampaign',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'clickedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['urlId'],
            referencedTableName: 'urls',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('urls', new TableIndex({
      name: 'IDX_URLS_SHORT_CODE',
      columnNames: ['shortCode'],
    }));

    await queryRunner.createIndex('urls', new TableIndex({
      name: 'IDX_URLS_USER_ID',
      columnNames: ['userId'],
    }));

    await queryRunner.createIndex('analytics', new TableIndex({
      name: 'IDX_ANALYTICS_URL_ID',
      columnNames: ['urlId'],
    }));

    await queryRunner.createIndex('analytics', new TableIndex({
      name: 'IDX_ANALYTICS_CLICKED_AT',
      columnNames: ['clickedAt'],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('analytics');
    await queryRunner.dropTable('urls');
    await queryRunner.dropTable('users');
  }
}