import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PetCard from '../../components/ui/PetCard';
import { Button } from '../../components/common/Button';

const PetListContent = ({ pets }) => {
  return (
    <div className="space-y-8">
      {/* Chỉ hiển thị tiêu đề nếu bạn muốn, hoặc bỏ đi tùy ý */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-pet-blue">Danh sách thú cưng</h2>
        <Link to="/profile/pets/create">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Thêm thú cưng
          </Button>
        </Link>
      </div>

      {pets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">Bạn chưa có thú cưng nào.</p>
          <Link to="/pet/create">
            <Button variant="outline">Thêm thú cưng ngay</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default PetListContent;