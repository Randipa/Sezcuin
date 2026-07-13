'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Empty, Input, Table } from 'antd';
import type { TableProps } from 'antd';
import { useMemo, useState } from 'react';

interface DataTableProps<T> {
  data: T[] | undefined;
  loading?: boolean;
  columns: TableProps<T>['columns'];
  rowKey: (record: T) => string;
  searchPlaceholder?: string;
  filterPredicate: (record: T, query: string) => boolean;
  onRowClick?: (record: T) => void;
  toolbarExtra?: React.ReactNode;
}

export function DataTable<T>({
  data,
  loading,
  columns,
  rowKey,
  searchPlaceholder = 'Search...',
  filterPredicate,
  onRowClick,
  toolbarExtra,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!data) {
      return [];
    }
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return data;
    }
    return data.filter((record) => filterPredicate(record, trimmed));
  }, [data, query, filterPredicate]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          allowClear
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="sm:max-w-xs"
        />
        {toolbarExtra}
      </div>

      <Table<T>
        rowKey={rowKey}
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <Empty description="No records found" /> }}
        pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
        onRow={(record) => ({
          onClick: () => onRowClick?.(record),
          className: onRowClick ? 'cursor-pointer' : undefined,
        })}
      />
    </div>
  );
}
