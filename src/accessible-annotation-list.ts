import { tag as html } from "./utils";
import { overrideController, overrideTemplate } from "./attach-angular";

/**
 * Make annotation accessible by wrapping it inside an actual
 * <a> anchor element in lieu of the terrible Jaavscript feature
 * that can only open in the current tab
 */
export function accessibleAnnotationList() {
  overrideController("readerInputItemViewer", [], function(args, next) {
    this.bfuzeGetAnnotationUrl = function() {
      const annotationId = this.item.id;
      const bookId = location.hash.split("/")[2];
      const pageId = this.item.pageId;

      return `https://ebooks.cenreader.com/#!/reader/${ bookId }/page/${ pageId }?highlight=${ annotationId }&scrollTo=${ annotationId }`;
    };

    return next(args);
  });

  overrideTemplate("app/reader/user-input/components/reader-input-item-viewer/reader-input-item-viewer.html", html`
    <div class="reader-input-item-viewer" ng-class="{'item-missing-page-border': !$ctrl.page,        'bookmark-error': $ctrl.type == 'bookmark' &amp;&amp; !$ctrl.page,        'notes-error': $ctrl.type == 'note' &amp;&amp; !$ctrl.page,        'highlight-error': $ctrl.type == 'highlight' &amp;&amp; !$ctrl.page,        'normal-bookmark': $ctrl.type == 'bookmark' &amp;&amp; $ctrl.page}">
        <div class="item-missing-page" ng-if="!$ctrl.page"><i class="material-icons md-18 icon">error</i><span class="caption">{{ 'GT_USER_INPUTS_NOT_DISPLAYED_TITLE' | translate }}</span></div>
        <div class="sync-content" gt-colors="{background: $ctrl.color}" ng-mouseover="$ctrl.hover = true" ng-mouseleave="$ctrl.hover = false" tabindex="-1" aria-label="{{($ctrl.item.options.selectedText) | decodeURI}}" ng-class="{'item-missing-page-cursor': !$ctrl.page &amp;&amp; $ctrl.hover,            'sync-content-bookmark': $ctrl.type == 'bookmark',            'sync-content-note': $ctrl.type == 'note',            'sync-content-highlight': $ctrl.type == 'highlight',            'page-exist': (!$ctrl.pageTitle &amp;&amp; $ctrl.hover) }">
            <a href="{{ $ctrl.bfuzeGetAnnotationUrl() }}" style="text-decoration: none; color: inherit;">
              <p ng-bind-html="($ctrl.markedHighlight || $ctrl.item.options.selectedText)                 | decodeURI | sanitizeText | readMore: {size: 320, html: true}" aria-label="{{ $ctrl.item.options.selectedText | decodeURI | sanitizeText | readMore: {full: true} }}" ng-if="$ctrl.item.options.selectedText &amp;&amp; $ctrl.type !== 'note' " tabindex="0"></p>
            </a>
            <div class="note-content" ng-if="$ctrl.type === 'note'" aria-label="{{($ctrl.item.options.selectedText + ', ' + $ctrl.item.options.noteText)| decodeURI | sanitizeText}}" tabindex="0"><span class="highlight-caption" ng-bind-html="($ctrl.markedselectedText || $ctrl.item.options.selectedText)                     | decodeURI | sanitizeText | readMore: {size: 320, html: true}" aria-label="{{ $ctrl.item.options.selectedText | decodeURI | sanitizeText | readMore: {full: true} }}" ng-if="$ctrl.item.options.selectedText" tabindex="-1"></span><span class="note-highlight" ng-bind-html="$ctrl.getNoteText()                     | decodeURI | readMore: {full: $ctrl.fullNote, size: 320, html: true}" aria-label="{{ $ctrl.item.options.noteText | decodeURI | readMore: {full: true} }}" ng-if="$ctrl.type === 'note' &amp;&amp; $ctrl.item.options.noteText" tabindex="-1"></span><span class="note-show-more-less" ng-if="$ctrl.item.options.noteText.length &gt; 320" ng-click="$ctrl.showMoreOrLess()" translate="{{$ctrl.moreOrLess}}"></span></div>
            <p ng-if="$ctrl.pageTitle &amp;&amp; $ctrl.type === 'bookmark'" ng-bind-html="($ctrl.markedBookmark || $ctrl.item.pageTitle)                 | decodeURI | sanitizeText | readMore: {size: 320, html: true}" tabindex="0" aria-label="{{ $ctrl.pageTitle | decodeURI | sanitizeText | readMore: {full: true} }}"></p>
            <p class="page-missing" ng-if="!$ctrl.page &amp;&amp; $ctrl.type === 'bookmark'" aria-label="{{'GT_USER_INPUT_MISSING_PAGE' | translate}}" translate="GT_USER_INPUT_MISSING_PAGE" tabindex="0"></p>
        </div>
        <div class="sync-menu"><i class="material-icons">{{$ctrl.getAnnotationIcon()}}</i><span tabindex="0" role="input" aria-label="{{$ctrl.type}}">{{$ctrl.typeTranslation}}</span><span class="flex"></span><span class="date">{{ $ctrl.item.$updated_at | date: 'shortDate' }}</span>
            <div class="anontation-select" ng-init="openAnnotationMenu = false" deep-blur="openAnnotationMenu = false" tabindex="-1" ng-class="{'anontation-select-expandet': openAnnotationMenu,                 'anontation-select-expandet-bookmark': openAnnotationMenu &amp;&amp; $ctrl.type == 'bookmark'}"><span class="anontation-menu" ng-click="openAnnotationMenu = !openAnnotationMenu;$ctrl.openDropdown($event, openAnnotationMenu)" ng-attr-expanded="{{ openAnnotationMenu }}" tabindex="-1"><i class="material-icons" tabindex="0" aria-label="{{'GT_USER_INPUT_OPTIONS' | translate}}">more_vert</i></span>
                <div class="anontation-dropdown" ng-class="{'fade': openAnnotationMenu,                     'last-item': $ctrl.isLastItem(openAnnotationMenu) &amp;&amp; $ctrl.item.type !== 'bookmark',                     'last-item-bookmark': $ctrl.isLastItem(openAnnotationMenu) &amp;&amp; $ctrl.item.type === 'bookmark'}" ng-click="openAnnotationMenu = false" ng-show="openAnnotationMenu" gt-colors="{                     color:'textColor'                 }" tabindex="-1">
                    <div class="anontation-menu-item" ng-class="{'disabled-div': !$ctrl.page}" gt-colors="{                             hover: {                                 background: 'primaryColor',                                 color: '#fff'                             }                         }"><button class="link" ng-class="{'disabled-button': !$ctrl.page}" ng-disabled="!$ctrl.page" gt-modal="gt-modal" params="$ctrl.goToAnnotationModal" approve-button="$ctrl.goToAnnotation()"></button></div>
                    <div class="anontation-menu-item" ng-if="$ctrl.type == 'note' || $ctrl.type == 'highlight'" gt-colors="{                             hover: {                                 background: 'primaryColor',                                 color: '#fff'                             }                         }"><button class="link" ng-if="$ctrl.type == 'note'" ng-click="$ctrl.openNoteMode($event)" translate="GT_USER_INPUT_EDIT_NOTE"></button><button class="link" ng-if="$ctrl.type == 'highlight'" ng-click="$ctrl.openNoteMode($event)" translate="GT_USER_INPUT_CHANGE_INTO_NOTE"></button></div>
                    <div class="anontation-menu-item" gt-colors="{                             hover: {                                 background: 'primaryColor',                                 color: '#fff'                             }                         }"><button class="link" gt-modal="gt-modal" params="$ctrl.modalParams" approve-button="$ctrl.delete()"></button></div>
                </div>
            </div>
        </div>
    </div>
    <reader-input-note settings="$ctrl.noteSettings" ng-if="$root.SessionService.readerMode == 'EDIT'        || $root.SessionService.readerMode == 'SINGLE'"></reader-input-note>
  `);
}

