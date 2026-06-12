import React, { useEffect } from 'react';
import { usePetStore } from '../../store/petStore';
import Loading from '../../components/common/Loading';
import PetListContent from './PetListContent';

const PetList = () => {
  // Lấy các state và action cần thiết từ Zustand store
  const { pets, loading, fetchPets } = usePetStore();

  useEffect(() => {
    // Gọi action từ store thay vì fetch thủ công tại component
    fetchPets();
  }, [fetchPets]);

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 pt-0 pb-10 text-left">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Pass trực tiếp dữ liệu từ store xuống component con */}
        <PetListContent pets={pets} />
      </div>
    </div>
  );
};

export default PetList;