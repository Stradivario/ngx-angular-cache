import {CacheLayerInterface, CacheServiceConfigInterface} from './ngx-cache-layer.interfaces';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Rx';

export class CacheLayer<T> extends Map {

  public items: BehaviorSubject<Array<T>> = new BehaviorSubject([]);
  public name: string;
  public config: CacheServiceConfigInterface;

  static createCacheParams(config) {
      if(config.params.constructor === Object) {
        return // Todo
      } else if (config.constructor === String) {
        return // Todo
      } else if (config.params.constructor === Number) {
        return // Todo
      } else if (config.params.constructor === Array) {
        return // Todo
      }
  }
  set(key, data) {
    return super.set(key, data);
  }

  get(name) {
    return super.get(name)
  }

  constructor(layer: CacheLayerInterface) {
    super();
    this.name = layer.name;
    this.config = layer.config;
    if (this.config.localStorage) {
      layer.items.forEach(item => this.set(item['key'], item));
      this.items.next([...this.items.getValue(), ...layer.items]);
    }
    this.initHook(layer);
  }

  private initHook(layer) {
    this.onExpireAll(layer)
  }

  private onExpireAll(layer) {
    layer.items.forEach(item => this.onExpire(item['key']))
  }

  private putItemHook(layerItem): void {
    this.onExpire(layerItem['key']);
  }

  public getItem(key: string): T {
    debugger
    if (this.has(key)) {
      return this.get(key);
    } else {
      return null;
    }
  }

  public putItem(layerItem: T): T {
    this.set(layerItem['key'], layerItem);
    const item = this.get(layerItem['key']);
    const test = this.items.getValue();
    const filteredItems = this.items.getValue().filter(item => item['key'] !== item['key']);
    const collection = [...filteredItems, item];
    if (this.config.localStorage) {
      localStorage.setItem(this.name, JSON.stringify(<CacheLayerInterface>{
        config: this.config,
        name: this.name,
        items: collection
      }));
    }
    this.items.next(collection);
    this.putItemHook(layerItem);
    return layerItem;
  }

  private onExpire(key: string): void {
    Observable
      .create(observer => observer.next())
      .timeoutWith(this.config.maxAge, Observable.of(1))
      .skip(1)
      .subscribe(observer => this.removeItem(key));
  }

  public removeItem(key: string): void {
    let newLayerItems = this.items.getValue().filter(item => item['key'] !== key);
    if (this.config.localStorage) {
      const newLayer = <CacheLayerInterface>{
        config: this.config,
        name: this.name,
        items: newLayerItems
      };
      localStorage.setItem(this.name, JSON.stringify(newLayer));
    }
    this.items.next(newLayerItems);
  }

}


// console.log(Array.from(this.keys()))