import React from 'react'

import type { ContactBlock as ContactBlockProps } from '@/payload-types'

export const ContactBlock: React.FC<ContactBlockProps> = ({
  title,
  subtitle,
  contactInfo,
  formFields,
  showMap,
  mapEmbedCode,
  layout = 'split',
}) => {
  // Determine layout classes
  const layoutClasses: Record<string, string> = {
    split: 'grid grid-cols-1 md:grid-cols-2 gap-12',
    'form-first': 'space-y-12',
    'info-first': 'space-y-12',
  }

  // Render form field based on type
  const renderFormField = (field: any, index: number) => {
    const { fieldType, label, name, placeholder, required } = field
    const fieldId = `contact-field-${index}-${name}`

    switch (fieldType) {
      case 'text':
        return (
          <div className="mb-4" key={index}>
            <label htmlFor={fieldId} className="block text-gray-700 mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              id={fieldId}
              name={name}
              placeholder={placeholder}
              required={required}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )
      case 'email':
        return (
          <div className="mb-4" key={index}>
            <label htmlFor={fieldId} className="block text-gray-700 mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              id={fieldId}
              name={name}
              placeholder={placeholder}
              required={required}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )
      case 'textarea':
        return (
          <div className="mb-4" key={index}>
            <label htmlFor={fieldId} className="block text-gray-700 mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={fieldId}
              name={name}
              placeholder={placeholder}
              required={required}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        )
      case 'select':
        return (
          <div className="mb-4" key={index}>
            <label htmlFor={fieldId} className="block text-gray-700 mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={fieldId}
              name={name}
              required={required}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
          </div>
        )
      case 'checkbox':
        return (
          <div className="mb-4" key={index}>
            <label className="flex items-center text-gray-700">
              <input
                type="checkbox"
                name={name}
                required={required}
                className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          </div>
        )
      default:
        return null
    }
  }

  // Render contact info item
  const renderContactItem = (item: any, index: number) => {
    const { type, label, value, icon, link } = item

    let iconElement = null
    if (icon) {
      iconElement = <span className="mr-2">{icon}</span>
    } else {
      // Default icons based on type
      switch (type) {
        case 'email':
          iconElement = <span className="mr-2">✉️</span>
          break
        case 'phone':
          iconElement = <span className="mr-2">📞</span>
          break
        case 'address':
          iconElement = <span className="mr-2">📍</span>
          break
        case 'social':
          iconElement = <span className="mr-2">📱</span>
          break
        default:
          iconElement = <span className="mr-2">ℹ️</span>
      }
    }

    return (
      <div key={index} className="flex items-start mb-3">
        {iconElement}
        <div>
          <div className="font-medium text-gray-900">{label}</div>
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {value}
            </a>
          ) : (
            <div className="text-gray-600">{value}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className={layoutClasses[layout ?? 'split'] || 'grid grid-cols-1 md:grid-cols-2 gap-12'}>
        {/* Contact Info Section */}
        <div>
          {(title || subtitle) && (
            <div className="mb-8">
              {title && <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>}
              {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
            </div>
          )}

          {contactInfo && contactInfo.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div>{contactInfo.map(renderContactItem)}</div>
            </div>
          )}

          {showMap && mapEmbedCode && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Location</h3>
              <div 
                dangerouslySetInnerHTML={{ __html: mapEmbedCode }} 
                style={{ width: '100%', height: '300px' }}
              />
            </div>
          )}
        </div>

        {/* Form Section */}
        {formFields && formFields.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h3>
            <form 
              className="bg-gray-50 p-6 rounded-lg"
              onSubmit={(e) => {
                e.preventDefault();
                console.log('Form submitted');
              }}
            >
              {formFields.map(renderFormField)}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Send Message
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContactBlock;