import { tag as html } from "./utils";
import { overrideController, overrideTemplate } from "./attach-angular";

export function accessibleSearchResult() {
  overrideController("searchResultItem", [], function(args, next) {
    const [ state ] = args;

    this.bfuzeGetPageLink = function() {
      const bookId = state.params.book;
      const pageId = state.params.page;
      const hlId = state.params.highlight;
      return `https://ebooks.cenreader.com/#!/reader/${ bookId }/page/${ pageId }?highlight=${ hlId }&scrollTo=${ hlId }&search=${ encodeURIComponent(this.searchQuery) }`;
    };

    return next(args);
  });

  overrideTemplate("app/reader/components/search-results/components/search-result-item/search-result-item.html", html`
    <div>
      <div 
        class="search-result-wrapper"
        ng-click="$ctrl.goToPage($event)"
        tabindex="-1"
        role="none"
        style="padding-bottom: 5px;">
          <div class="search-result-title" ng-bind-html="$ctrl.getPageTitle()" tabindex="0" role="link" aria-label="{{'GT_SEARCH_PAGE_TITLE' | translate}}{{$ctrl.pageTitle | sanitizeText}}"></div>
          <div><button class="occurrences-button" ng-click="$ctrl.showMoreLess($event)" gt-colors="{                 'borderColor': 'primaryColor',                'color': 'primaryColor'            }" tabindex="0" aria-label="{{$ctrl.occurrences}} {{'GT_SEARCH_OCCURRENCES' | translate}}"><span translate="GT_SEARCH_OCCURRENCES" translate-values="{ count: $ctrl.occurrences }"></span></button><button class="show-more-less-button" ng-if="$ctrl.result.previews.length &gt; 1" ng-click="$ctrl.showMoreLess($event)" gt-colors="{                 'color': 'primaryColor',                'borderColor': 'transparent',                'background-color': 'transparent'            }" tabindex="-1"><span class="show-more-less-btn" role="button" ng-if="$ctrl.collapsed" translate="GT_SHOW_MORE" tabindex="0" aria-label="{{'GT_SHOW_MORE' | translate}}"></span><span class="show-more-less-btn" role="button" ng-if="!$ctrl.collapsed" translate="GT_SHOW_LESS" tabindex="0" aria-label="{{'GT_SHOW_LESS' | translate}}"></span></button></div>
          <div class="search-result-content" ng-repeat="preview in $ctrl.collapsed == false ? $ctrl.previews : [$ctrl.previews[0]]" ng-bind-html="preview.previewText" tabindex="0" role="button" aria-label="{{preview.ariaLabelText}}" ng-click="$ctrl.goToPage($event)"></div>
      </div>
      <a
        href="{{ $ctrl.bfuzeGetPageLink() }}"
        target="_blank"
        style="display: block; padding-left: 15px; padding-bottom: 15px;"
      >
        Open in new tab <i class="material-icons" aria-hidden="true" style="font-size: inherit; vertical-align: middle;">launch</i>
      </a>
    </div>
  `);
}

