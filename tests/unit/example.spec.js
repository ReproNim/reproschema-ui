// Testing VueJS applications that rely on components like the router and vuex
// store can be quite complex. This example should help you understand the
// basic structure of these tests.
// For more info, see: https://vue-test-utils.vuejs.org/guides/#testing-vuex-in-components

// First, import the stuff we need from the testing utilities package.
// What each thing does will be described when it is first invoked below.
import { shallowMount, createLocalVue } from '@vue/test-utils'

// We will be using the store, so we'll import Vuex to do so.
import Vuex from 'vuex'
// Also i18n
import i18n from '../../src/i18n'

// We're also going to import the component we want to test from the main part
// of our project. In our case it's the App component that contains all the
// other components.
import App from '../../src/App'

// We now create a local Vue instance. This is necessary because we can't
// attach a Vuex store to a shallowMount-ed component on its own.
const localVue = createLocalVue()

// We tell the local Vue instance to use a Vuex store just like we would if we
// were creating a Vue-Vuex instance for real.
localVue.use(Vuex)

// This is our first test set. All the tests share a similar structure of
// fnc(name: string, content: function)
// In this case we are calling the test set 'Actions.vue' and defining the tests
// within the anonymous function provided as the second argument to describe()
describe('Actions.vue', () => {
  let actions
  let store

  // Each it() call below will start in a new instance to give it a clean slate.
  // We often want to go through a similar setup procedure for a bunch of our
  // tests, and we can avoid duplicating code by using the beforeEach() function
  // to write an anonymous function that gets called before the content of each
  // subsequent call to it().
  // Here, we have an anonymous function that creates a new Vuex store with
  // actions defined by the jest testing framework.
  beforeEach(() => {
    actions = {
      setActivityIndex: jest.fn()
    }
    store = new Vuex.Store({
      actions
    })
  })

  // This is our first actual test.
  // As with describe(), it() takes two arguments, a string that describes the
  // test and a function that provides instructions for how to carry out the
  // test.
  // The app tracks where the user is using router, and stores the value in
  // the store. We want to check this behaviour by ensuring that the App
  // component tells the store to change the activityIndex when the route is
  // changed.
  it('dispatches "setActivityIndex" when $route changes', () => {
    // shallowMount creates a component in a shallow way by replacing all its
    // child components with stubs. This allows us to efficiently test just that
    // component.
    // Here we are telling the testing framework to provide a shallow mount of
    // our App component bound to our local Vue instance and using the store.
    // We are also telling the App to start with a mock-up of the router that
    // will pretend that the user has navigated to the second set of questions.
    const wrapper = shallowMount(App, {
      store,
      localVue,
      i18n,
      mocks: {
        $route: {
          params: {
            id: 1
          },
          // We use i18n localisation, so we also mock up that bit of $route
          query: {
            lang: 'en'
          }
        }
      }
    })
    // Check that the Vuex store was asked to set the activityIndex
    expect(actions.setActivityIndex).toHaveBeenCalled()
    // And check that one of the navigation items was marked as 'current'
    wrapper.find('li.current')
  })
})

