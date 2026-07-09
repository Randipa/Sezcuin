'use client';

import { Button, Drawer, Form, Grid } from 'antd';
import type { FormInstance } from 'antd';
import type { ReactNode } from 'react';

const { useBreakpoint } = Grid;

interface FormDrawerProps<Values> {
  open: boolean;
  title: string;
  onClose: () => void;
  form: FormInstance<Values>;
  onFinish: (values: Values) => void;
  submitting?: boolean;
  submitLabel?: string;
  children: ReactNode;
}

export function FormDrawer<Values>({
  open,
  title,
  onClose,
  form,
  onFinish,
  submitting,
  submitLabel = 'Save',
  children,
}: FormDrawerProps<Values>) {
  const screens = useBreakpoint();
  const size = screens.sm ? 480 : '100%';

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      size={size}
      destroyOnHidden
      maskClosable={!submitting}
      closable={!submitting}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="primary" loading={submitting} onClick={() => form.submit()}>
            {submitLabel}
          </Button>
        </div>
      }
    >
      <Form<Values> form={form} layout="vertical" onFinish={onFinish} disabled={submitting}>
        {children}
      </Form>
    </Drawer>
  );
}
