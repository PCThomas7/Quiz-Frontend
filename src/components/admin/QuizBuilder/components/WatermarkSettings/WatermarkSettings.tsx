interface WatermarkSettingsProps {
  watermark: {
    enabled: boolean;
    text: string;
  };
  onWatermarkChange: (watermark: {
    enabled: boolean;
    text: string;
  }) => void;
}

export const WatermarkSettings = ({
  watermark,
  onWatermarkChange
}: WatermarkSettingsProps) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Watermark Settings
      </label>
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="watermarkEnabled"
            checked={watermark?.enabled}
            onChange={(e) =>
              onWatermarkChange({
                ...watermark,
                enabled: e.target.checked,
              })
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="watermarkEnabled"
            className="ml-2 text-sm text-gray-700"
          >
            Enable Watermark
          </label>
        </div>
        {watermark?.enabled && (
          <div className="flex-1">
            <input
              type="text"
              value={watermark.text}
              onChange={(e) =>
                onWatermarkChange({
                  ...watermark,
                  text: e.target.value,
                })
              }
              placeholder="Enter watermark text..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};