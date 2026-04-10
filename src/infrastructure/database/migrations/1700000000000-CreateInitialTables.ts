import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateInitialTables1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

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
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
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
            name: 'original_url',
            type: 'text',
          },
          {
            name: 'shortCode',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'clicks',
            type: 'integer',
            default: 0,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_custom_code',
            type: 'boolean',
            default: false,
          },
          {
            name: 'qr_code_url',
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
            name: 'max_clicks',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'urls',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'click_analytics',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'url_id',
            type: 'uuid',
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
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
            length: '100',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'region',
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
            name: 'operating_system',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'is_mobile',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_bot',
            type: 'boolean',
            default: false,
          },
          {
            name: 'language',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'screen_resolution',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'utm_source',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'utm_medium',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'utm_campaign',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'utm_term',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'utm_content',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'click_analytics',
      new TableForeignKey({
        columnNames: ['url_id'],
        referencedTableName: 'urls',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'urls',
      new TableIndex({
        name: 'IDX_URLS_SHORT_CODE',
        columnNames: ['shortCode'],
      }),
    );

    await queryRunner.createIndex(
      'urls',
      new TableIndex({
        name: 'IDX_URLS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'click_analytics',
      new TableIndex({
        name: 'IDX_CLICK_ANALYTICS_URL_ID_CREATED_AT',
        columnNames: ['url_id', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('click_analytics');
    await queryRunner.dropTable('urls');
    await queryRunner.dropTable('users');
  }
}
