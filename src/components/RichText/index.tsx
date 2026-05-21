import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  upload: ({ node }) => {
    // Handle uploaded media in rich text
    const resourceId = typeof node.value === 'string' ? node.value : (node.value && typeof node.value === 'object' && 'id' in node.value ? (node.value as any).id : undefined);
    
    // Safely extract link properties if they exist
    let linkProps = null;
    if (node.fields?.enableLink && node.fields?.link && node.fields.link.type) {
      linkProps = {
        type: node.fields.link.type,
        url: node.fields.link.type === 'custom' ? node.fields.link.url : undefined,
        reference: node.fields.link.type === 'internal' ? node.fields.link.reference : undefined,
        newTab: node.fields.link.newTab,
      };
    }
    
    // If we have a resource ID, render the Media component wrapped in a link if needed
    if (resourceId) {
      const mediaElement = <Media resource={node.value as any} />;
      
      if (linkProps) {
        return (
          <CMSLink
            type={linkProps.type}
            url={linkProps.url}
            reference={linkProps.reference}
            newTab={linkProps.newTab}
          >
            {mediaElement}
          </CMSLink>
        );
      }
      
      return mediaElement;
    }
    
    // Fallback for when resource is not available
    const imgElement = <img src={(node.value as any)?.filename || ''} alt={node.fields?.alt || ''} />;
    
    if (linkProps) {
      return (
        <CMSLink
          type={linkProps.type}
          url={linkProps.url}
          reference={linkProps.reference}
          newTab={linkProps.newTab}
        >
          {imgElement}
        </CMSLink>
      );
    }
    
    return imgElement;
  },
  heading: ({ node, nodesToJSX }) => {
    const Tag = node.tag;
    return (
      <Tag className={`mb-4 mt-6 font-bold ${Tag === 'h1' ? 'text-3xl' : Tag === 'h2' ? 'text-2xl' : Tag === 'h3' ? 'text-xl' : 'text-lg'}`}>
        {nodesToJSX({ nodes: node.children })}
      </Tag>
    );
  },
  blockquote: ({ node, nodesToJSX }) => (
    <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-gray-600">
      {nodesToJSX({ nodes: node.children })}
    </blockquote>
  ),
  listItem: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });
    if (node.checked !== undefined) {
      // Checklist item
      return (
        <li className="flex items-start mb-2">
          <input
            type="checkbox"
            checked={Boolean(node.checked)}
            readOnly
            className="mt-1 mr-2 h-4 w-4 text-primary rounded focus:ring-primary"
          />
          <span>{children}</span>
        </li>
      );
    }
    // Regular list item
    return <li className="mb-2">{children}</li>;
  },
  orderedList: ({ node, nodesToJSX }) => (
    <ol className={`list-decimal pl-6 my-4 ${node.start !== undefined && node.start !== 1 ? 'list-inside' : ''}`} start={node.start}>
      {nodesToJSX({ nodes: node.children })}
    </ol>
  ),
  unorderedList: ({ node, nodesToJSX }) => (
    <ul className="list-disc pl-6 my-4">
      {nodesToJSX({ nodes: node.children })}
    </ul>
  ),
  horizontalRule: () => (
    <hr className="my-6 border-t border-border" />
  ),
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}