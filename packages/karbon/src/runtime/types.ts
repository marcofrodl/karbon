import type { NormalizeArticle } from './api/normalize-article'

export type PayloadScope = 'posts' | 'tags' | 'desks' | 'authors'
export type Resources = 'article' | 'desk' | 'tag' | 'author'
export type Identity = 'id' | 'slug' | 'sid'

export interface Identifiable {
  id: string
  slug?: string
  sid?: string
}

type BaseID<Type extends Resources> =
  | {
      type: Type
      id: string
    }
  | {
      type: Type
      slug: string
    }

export type ArticleID =
  | BaseID<'article'>
  | {
      type: 'article'
      sid: string
    }

export type DeskID = BaseID<'desk'>
export type AuthorID = BaseID<'author'>
export type TagID = BaseID<'tag'>

export type ResourceID = ArticleID | DeskID | AuthorID | TagID

export interface ResourcePageContext {
  resource: Resources
  identity: Identity
  prefix: string
}

export interface ResourcePage<Meta extends Identifiable, Ctx = ResourcePageContext> {
  route: string
  enable: boolean
  getIdentity(params: Record<string, string>, _context: Ctx): ResourceID
  isValid(params: Record<string, string>, resource: Meta, _context: Ctx): boolean
  toURL(resource: Meta, _context: Ctx): string
  _context?: Ctx
  groupKey?: string
}

export interface BaseMeta {
  id: string
  slug: string
  sid: string
}

export interface ArticleDesk {
  id: string
  name: string
  slug: string
  desk?: ArticleDesk | null
}

export interface ArticleTag {
  id: string
  name: string
  slug: string
}

export type ArticleMeta = BaseMeta & {
  layout: string
  title: string
  blurb: string
  content: string
  published_at: string
  desk: ArticleDesk
  tags: ArticleTag[]
}
export type DeskMeta = BaseMeta
export type AuthorMeta = BaseMeta
export type TagMeta = BaseMeta

export interface MetaMap {
  article: ArticleMeta
  desk: DeskMeta
  author: AuthorMeta
  tag: TagMeta
}

export interface IdComparisonMap {
  slugs: Record<string, string>
  sids: Record<string, string>
}

export interface URLGenerators {
  article: ResourcePage<ArticleMeta>
  desk: ResourcePage<DeskMeta>
  author: ResourcePage<AuthorMeta>
  tag: ResourcePage<TagMeta>
  [key: string]: ResourcePage<TagMeta>
}

export interface SEOConfig {
  preset?: string
  provider?: string
  options?: Record<string, any>
}

export interface ResolvedSEOConfig {
  preset?: string
  importName?: string
  importPath?: string
  options: Record<string, any>
}

export interface UserSEOConfig extends Omit<ResolvedSEOConfig, 'importName' | 'importPath'> {
  importName: string
  importPath: string
}

interface PaywallOption {
  enable?: boolean
  logo: string
}

export interface StoripressRuntimeConfig {
  fullStatic?: boolean
  fallback?: { layout?: string | null }
  previewParagraph: number
  paywall?: PaywallOption
  payloadAbsoluteURL?: boolean

  apiHost: string
  apiToken: string
  clientId: string
  stripeKey?: string
  searchKey: string
  searchDomain?: string
  encryptKey?: string
}

export type StoripressPublicRuntimeConfig = Omit<StoripressRuntimeConfig, 'apiToken' | 'stripeKey' | 'encryptKey'>

export interface ModuleRuntimeConfig {
  storipress: StoripressRuntimeConfig
}

export interface ModulePublicRuntimeConfig {
  siteUrl?: string
  storipress: StoripressPublicRuntimeConfig
}

export interface ModuleOptions {
  fullStatic: boolean
  fallback: { layout?: string | null }
  resources: URLGenerators
  paywall: PaywallOption
  seo: SEOConfig[]
  isViewable: string
  previewParagraph: number
}

export enum ArticlePlan {
  /** Free */
  Free = 'free',
  /** Member */
  Member = 'member',
  /** Subscriber */
  Subscriber = 'subscriber',
}

export interface Article {
  __typename?: 'Article'
  id: string
  blurb?: string | null
  published_at?: any | null
  slug: string
  title: string
  cover?: any | null
  seo?: any | null
  html?: string | null
  plaintext?: string | null
  plan: ArticlePlan
  desk: {
    __typename?: 'Desk'
    id: string
    name: string
    slug: string
    layout?: { __typename?: 'Layout'; id: string; name: string } | null
    desk?: {
      __typename?: 'Desk'
      id: string
      name: string
      slug: string
      layout?: { __typename?: 'Layout'; id: string; name: string } | null
    } | null
  }
  authors: {
    id: string
    bio?: string
    socials?: JSON
    avatar?: string
    email?: string
    location?: string
    first_name?: string
    last_name?: string
    full_name?: string
    name?: string
  }[]
  layout?: { __typename?: 'Layout'; id: string; name: string } | null
  tags: Array<{ __typename?: 'Tag'; id: string; name: string; slug: string }>
  relevances: { id: string; title: string }[]
  metafields: Array<{
    id: string
    key: string
    type: string
    group: {
      id: string
      key: string
      type: string
    }
    values: Array<{ id: string; value: any }>
  }>
}

export type UseArticleReturn = Omit<Article, keyof NormalizeArticle> & NormalizeArticle
export type UseArticleReturnWithURL = UseArticleReturn & { url: string }
