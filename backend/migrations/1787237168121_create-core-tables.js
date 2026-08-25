exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TYPE user_role AS ENUM ('owner', 'cashier', 'warehouse_staff');
    CREATE TYPE movement_type AS ENUM ('in', 'out');

    CREATE TABLE businesses (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role user_role NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX idx_users_business_id ON users(business_id);

    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      barcode TEXT,
      name TEXT NOT NULL,
      category TEXT,
      purchase_price NUMERIC(12,2) NOT NULL,
      sale_price NUMERIC(12,2) NOT NULL,
      lead_time_days INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (business_id, barcode)
    );
    CREATE INDEX idx_products_business_id ON products(business_id);

    CREATE TABLE stock_movements (
      id SERIAL PRIMARY KEY,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      type movement_type NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      reason TEXT,
      created_by_user_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX idx_stock_movements_business_id ON stock_movements(business_id);
    CREATE INDEX idx_stock_movements_product_id_created_at ON stock_movements(product_id, created_at);

    CREATE TABLE sales (
      id SERIAL PRIMARY KEY,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      cashier_id INTEGER NOT NULL REFERENCES users(id),
      total_amount NUMERIC(12,2) NOT NULL,
      idempotency_key TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX idx_sales_business_id ON sales(business_id);

    CREATE TABLE sale_items (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER NOT NULL REFERENCES sales(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price NUMERIC(12,2) NOT NULL
    );
    CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS sale_items;
    DROP TABLE IF EXISTS sales;
    DROP TABLE IF EXISTS stock_movements;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS businesses;
    DROP TYPE IF EXISTS movement_type;
    DROP TYPE IF EXISTS user_role;
  `);
};

