import React from 'react';
import { Calendar, Syringe, AlertCircle } from 'lucide-react';

const VaccinationCard = ({ vaccine }) => {
  // Kiểm tra xem đã đến lịch nhắc lại chưa (so với ngày hiện tại)
  const isOverdue = new Date(vaccine.nextDueDate) < new Date();

  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-pet-blue/10 bg-white transition-all">
      <div className="p-3 bg-pet-blue/10 rounded-xl text-pet-blue shrink-0">
        <Syringe size={20} />
      </div>
      
      <div className="flex-grow min-w-0">
        <h4 className="font-bold text-gray-900 text-base truncate">{vaccine.vaccineName}</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs font-medium text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>Ngày tiêm: {vaccine.dateAdministered}</span>
          </div>
          
          <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-500 font-bold' : 'text-emerald-600'}`}>
            <AlertCircle size={14} />
            <span>Nhắc lại: {vaccine.nextDueDate} {isOverdue && '(Quá hạn!)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccinationCard;