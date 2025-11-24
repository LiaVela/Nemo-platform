// src/components/settings/SettingsSection.jsx

export function SettingsSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {children}
      </div>
    </div>
  );
}

export function SettingItem({ label, description, children }) {
  return (
    <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </h3>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        <div className="ml-4">
          {children}
        </div>
      </div>
    </div>
  );
}