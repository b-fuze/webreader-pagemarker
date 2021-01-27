import { tag as html } from "./utils";
import { overrideController, overrideTemplate } from "./attach-angular";

export function collapsibleTocItem() {
  overrideController("newTocReaderItem", [], function(args, next) {
    const [ state ] = args;
    const instance = next(args);

    this.openPage = function(e: any) {
      const evt = event;
      const target = evt?.target as Element | null;
      let isToggleAction = target?.classList.contains("nav-ico");

      if (this.item.children) {
        this.showChild = !this.showChild;
        this.shouldStayOpen = !this.shouldStayOpen;
      }

      if (!isToggleAction) {
        state.go("reader.book.page", {
          page: this.item.id,
          scrollTo: e || null,
        });
      }
    };

    return instance;
  });

  overrideTemplate("app/reader/components/reader-toc/components/reader-toc-item-new/reader-toc-item-new.html", html`
    <div class="toc-item">
        <div
          class="text toc-page-root"
          ng-class="{
              'selected-page': $ctrl.isSelectedPage(),
          }"
          ng-click="$ctrl.openPage()"
          role="button"
          aria-live="{{$ctrl.ariaLive}}"
          aria-label="{{$ctrl.item.title | decodeHTML }} {{$ctrl.getStatus()}}"
          tabindex="22" id="{{$ctrl.item.id}}">
          <i
            class="material-icons"
            ng-if="!$ctrl.item.children.length">description</i>
          <i
            class="material-icons nav-ico"
            ng-if="$ctrl.item.children.length &amp;&amp; !$ctrl.showChild">keyboard_arrow_right</i>
          <i
            class="material-icons nav-ico"
            ng-if="$ctrl.item.children.length &amp;&amp; $ctrl.showChild">keyboard_arrow_down</i>
          <label
            class="link"
            ng-bind-html="$ctrl.item.title | decodeHTML | readMore: {size: 50}"></label>
        </div>
        <ul
          class="toc-nested"
          ng-if="$ctrl.item.children.length"
          ng-show="$ctrl.shouldStayOpen">
            <li
              ng-repeat="child in $ctrl.item.children"
              ng-class="child.modelName">
                <new-toc-reader-item item="child"></new-toc-reader-item>
            </li>
        </ul>
    </div>
  `);
}

