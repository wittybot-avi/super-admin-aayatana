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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 gap-8">
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

      <div className="grid grid-cols-2 gap-8">
        <div>
          <Input 
            label="Tenant Slug (URL)" 
            value={data.slug} 
            onChange={(e) => updateData({ slug: e.target.value })}
            className={slugAvailable === false ? 'border-red-500 focus:ring-red-500/20' : slugAvailable === true ? 'border-teal-500 focus:ring-teal-500/20' : ''}
          />
          {slugAvailable === false && <p className="text-xs text-red-500 mt-1.5 font-medium">Slug already taken</p>}
          {slugAvailable === true && <p className="text-xs text-teal-600 mt-1.5 font-medium">Available!</p>}
        </div>
        <Input 
          label="Contact Email" 
          type="email"
          value={data.contactEmail} 
          onChange={(e) => updateData({ contactEmail: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Customer Type</label>
        <div className="relative">
            <select 
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none shadow-sm transition-all"
            value={data.customerType}
            onChange={(e) => updateData({ customerType: e.target.value as any })}
            >
            <option value="">Select a customer type...</option>
            {CUSTOMER_TYPES.map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Industry Tags</label>
        <div className="flex flex-wrap gap-3">
          {['EV_2W', 'EV_3W', 'EV_4W', 'EV_CV', 'DRONES', 'DEFENCE'].map((tag) => (
            <button
              key={tag}
              onClick={() => handleIndustryChange(tag as IndustryTag)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 shadow-sm ${
                data.industryTags.includes(tag as IndustryTag)
                  ? 'bg-teal-50 border-teal-200 text-teal-700 shadow-teal-100'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
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