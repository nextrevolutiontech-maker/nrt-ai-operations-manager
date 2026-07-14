'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, categoryService, brandService, unitService } from '../../../services/master-data';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { AppTable, ColumnDef } from '../../../components/tables/AppTable';
import { ProductForm, ProductFormData } from '../../../components/forms/ProductForm';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const queryClient = useQueryClient();

  // Parallel queries for necessary master data
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAll(),
  });

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.getAll() });
  const { data: brandsData } = useQuery({ queryKey: ['brands'], queryFn: () => brandService.getAll() });
  const { data: unitsData } = useQuery({ queryKey: ['units'], queryFn: () => unitService.getAll() });

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: ProductFormData }) => 
      productService.update(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleOpenForm = (product?: any) => {
    setEditingProduct(product || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const onSubmitForm = async (formData: ProductFormData) => {
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, payload: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const columns: ColumnDef[] = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Product Name' },
    { 
      key: 'category', 
      label: 'Category',
      render: (row) => row.category?.name || '-'
    },
    { 
      key: 'brand', 
      label: 'Brand',
      render: (row) => row.brand?.name || '-'
    },
    { 
      key: 'price', 
      label: 'Price',
      render: (row) => `$${Number(row.price).toFixed(2)}`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
          {row.status || 'ACTIVE'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenForm(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this product?')) {
                deleteMutation.mutate(row.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Products Catalog" 
        description="Manage your master product list, pricing, and inventory parameters"
        action={
          <button 
            onClick={() => handleOpenForm()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        }
      />
      
      <div className="mt-6">
        <AppTable 
          columns={columns} 
          data={productsData?.data || []} 
          isLoading={isLoadingProducts}
        />
      </div>

      <ProductForm 
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={onSubmitForm}
        initialData={editingProduct}
        isLoading={createMutation.isPending || updateMutation.isPending}
        categories={categoriesData?.data || []}
        brands={brandsData?.data || []}
        units={unitsData?.data || []}
      />
    </DashboardLayout>
  );
}
