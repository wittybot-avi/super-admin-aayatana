import React, { useEffect } from 'react';
import { OnboardingState, IndustryTag } from '../../../types';
import { CUSTOMER_TYPES } from '../../../constants';
import { Input } from '../../ui/Input';
import { TenantService } from '../../../services/tenantService';

interface Step1Props {
  data: OnboardingState;
  updateData: (updates: Partial<OnboardingState>) => void;
}

export const Step1_Profile: React.FC<Step1Props> = ({ data, updateData }) => {
  const [slugAvailable, setSlugAvailable] = React.useState<boolean | null>(null);

  // Auto-generate slug
  useEffect(() => {
    if (data.name && !data.slug) {
      const genSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      updateData({ slug: genSlug });
    }
  }, [data.name]);

  // Check slug availability (mock debounce)
  useEffect(() => {
    if (data.slug) {
      const timer = setTimeout(async () => {
        const avail = await TenantService.checkSlugAvailability(data.slug);
        setSlugAvailable(avail);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data.slug]);

  const handleIndustryChange = (tag: IndustryTag) => {
    if (data.industryTags.includes(tag)) {
      updateData({ industryTags: data.industryTags.filter(t => t !== tag) });
    } else {
      updateData({ industryTags: [...data.industryTags, tag] });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 gap-6">
        <Input 
          label="Organization Name" 
          value={data.name} 
          onChange={(e) => updateData({ name: e.target.value })} 
          placeholder="e.g. Acme Batteries"
        />
        <Input 
          label="Legal Entity Name" 
          value={data.legalName} 
          onChange={(e) => updateData({ legalName: e.target.value })} 
          placeholder="e.g. Acme Batteries Pvt Ltd"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Input 
            label="Tenant Slug (URL)" 
            value={data.slug} 
            onChange={(e) => updateData({ slug: e.target.value })}
            className={slugAvailable === false ? 'border-red-500' : slugAvailable === true ? 'border-green-500' : ''}
          />
          {slugAvailable === false && <p className="text-xs text-red-500 mt-1">Slug already taken</p>}
          {slugAvailable === true && <p className="text-xs text-green-600 mt-1">Available!</p>}
        </div>
        <Input 
          label="Contact Email" 
          type="email"
          value={data.contactEmail} 
          onChange={(e) => updateData({ contactEmail: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Customer Type</label>
        <select 
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={data.customerType}
          onChange={(e) => updateData({ customerType: e.target.value as any })}
        >
          <option value="">Select a type...</option>
          {CUSTOMER_TYPES.map(type => (
            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Industry Tags</label>
        <div className="flex flex-wrap gap-2">
          {['EV_2W', 'EV_3W', 'EV_4W', 'EV_CV', 'DRONES', 'DEFENCE'].map((tag) => (
            <button
              key={tag}
              onClick={() => handleIndustryChange(tag as IndustryTag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                data.industryTags.includes(tag as IndustryTag)
                  ? 'bg-indigo-100 border-indigo-200 text-indigo-800'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tag.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};