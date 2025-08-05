import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TranslationDemo() {
  const { t } = useTranslation('common');
  const { t: tParks } = useTranslation('parks');
  const { t: tFinance } = useTranslation('finance');
  const { t: tUsers } = useTranslation('users');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('navigation.dashboard')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Navegación:</h3>
          <ul className="space-y-1 text-sm">
            <li>• {t('navigation.parks')}</li>
            <li>• {t('navigation.users')}</li>
            <li>• {t('navigation.finance')}</li>
            <li>• {t('navigation.volunteers')}</li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">{tParks('title')}:</h3>
          <p className="text-sm">{tParks('subtitle')}</p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">{tFinance('title')}:</h3>
          <p className="text-sm">{tFinance('subtitle')}</p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">{tUsers('title')}:</h3>
          <p className="text-sm">{tUsers('subtitle')}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Acciones:</h3>
          <div className="flex gap-2 text-sm">
            <button className="px-3 py-1 bg-blue-500 text-white rounded">
              {t('actions.save')}
            </button>
            <button className="px-3 py-1 bg-gray-500 text-white rounded">
              {t('actions.cancel')}
            </button>
            <button className="px-3 py-1 bg-green-500 text-white rounded">
              {t('actions.edit')}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}