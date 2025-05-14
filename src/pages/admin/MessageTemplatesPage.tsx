import { useState, useEffect } from 'react';
import { getMessageTemplates, updateMessageTemplate, MessageTemplate } from '../../firebase';
import Button from '../../components/common/Button';

interface MessageTemplatesPageProps {
  salonId: string;
}

export default function MessageTemplatesPage({ salonId }: MessageTemplatesPageProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [editedTemplate, setEditedTemplate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (salonId) {
      loadTemplates();
    }
  }, [salonId]);

  async function loadTemplates() {
    try {
      if (!salonId) {
        setError('No salon selected');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError('');
      
      const data = await getMessageTemplates(salonId);
      setTemplates(data);
      
      // Select the first template by default if there is one
      if (data.length > 0 && !selectedTemplate) {
        handleSelectTemplate(data[0]);
      } else if (data.length === 0) {
        setError('No message templates found for this salon');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load message templates');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectTemplate(template: MessageTemplate) {
    setSelectedTemplate(template);
    setEditedTemplate(template.template);
    setError('');
    setSuccess('');
  }

  async function handleSaveTemplate() {
    if (!selectedTemplate || !salonId) return;
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await updateMessageTemplate(salonId, selectedTemplate.id, editedTemplate);
      
      // Update the templates list
      setTemplates(templates.map(t => 
        t.id === selectedTemplate.id 
          ? { ...t, template: editedTemplate } 
          : t
      ));
      
      setSuccess('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      setError('Failed to save template');
    } finally {
      setSaving(false);
    }
  }

  if (!salonId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded">
          Please select a salon to manage message templates
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Message Templates</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <p>Loading templates...</p>
        </div>
      ) : error && templates.length === 0 ? (
        <div className="bg-red-50 text-red-600 p-4 rounded">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Available Templates</h2>
            <div className="bg-white rounded-lg shadow divide-y">
              {templates.map(template => (
                <button
                  key={template.id}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                    selectedTemplate?.id === template.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-gray-500">
                    {template.type.replace(/_/g, ' ')}
                  </p>
                </button>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            {selectedTemplate ? (
              <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">{selectedTemplate.name}</h2>
                  <p className="text-gray-500">Edit this template for {selectedTemplate.type.replace(/_/g, ' ')}</p>
                </div>
                
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 text-green-600 p-3 rounded text-sm">
                    {success}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Template Text
                  </label>
                  <textarea
                    value={editedTemplate}
                    onChange={(e) => setEditedTemplate(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter the message template here..."
                  />
                  
                  <div className="text-sm bg-blue-50 p-3 rounded">
                    <p className="font-medium text-blue-800">Available placeholders:</p>
                    <ul className="list-disc pl-5 text-blue-700 mt-1 space-y-1">
                      <li><code>{'{{name}}'}</code> - Customer's name</li>
                      <li><code>{'{{service}}'}</code> - Service name</li>
                      <li><code>{'{{time}}'}</code> - Appointment time</li>
                      <li><code>{'{{date}}'}</code> - Appointment date</li>
                      <li><code>{'{{salon}}'}</code> - Salon name</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveTemplate}
                    loading={saving}
                    disabled={!editedTemplate || editedTemplate === selectedTemplate.template}
                  >
                    Save Template
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-48">
                <p className="text-gray-500">Select a template to edit</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 