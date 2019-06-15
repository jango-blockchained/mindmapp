import {Component, OnInit} from '@angular/core'
import {DialogService} from '../../../../core/services/dialog.service'
import {MapOptions} from '../../../../shared/models/mmp.model'
import {MapCacheService} from '../../../../core/services/map-cache.service'
import {MmpService} from '../../../../core/services/mmp.service'
import {SettingsService} from '../../../../core/services/settings.service'
import {UtilsService} from '../../../../core/services/utils.service'
import {CachedMap} from '../../../../shared/models/cached-map.model'

@Component({
    selector: 'mindmapp-application',
    templateUrl: './application.component.html',
    styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit {

    public node: any

    constructor (private dialogService: DialogService,
                 private mmpService: MmpService,
                 private settingsService: SettingsService,
                 private mapCacheService: MapCacheService) {
        this.node = {}
    }

    public async ngOnInit () {
        const settings = this.settingsService.getCachedSettings()

        // Create the mind map.
        this.initMap(settings.mapOptions)

        this.handleImageDropObservable()
    }

    public handleImageDropObservable () {
        UtilsService.observableDroppedImages().subscribe((image: string) => {
            this.mmpService.updateNode('imageSrc', image)
        })
    }

    public async initMap (options: MapOptions) {
        this.mmpService.create('map_1', options)

        const lastCachedMap: CachedMap = await this.mapCacheService.setLastMap()

        if (lastCachedMap) {
            this.mmpService.new(lastCachedMap.data)
        }

        this.node = this.mmpService.selectNode()

        this.mmpService.addNodesOnRightClick()

        // Initialize all listeners
        this.createMapListeners()
    }

    public createMapListeners () {
        this.mmpService.on('nodeSelect').subscribe((node) => {
            Object.assign(this.node, node)
        })

        this.mmpService.on('nodeDeselect').subscribe(() => {
            Object.assign(this.node, this.mmpService.selectNode())
        })

        this.mmpService.on('nodeUpdate').subscribe((node) => {
            Object.assign(this.node, node)
            this.mapCacheService.updateCachedStatus()
        })

        this.mmpService.on('undo').subscribe(() => {
            Object.assign(this.node, this.mmpService.selectNode())
            this.mapCacheService.updateCachedStatus()
        })

        this.mmpService.on('redo').subscribe(() => {
            Object.assign(this.node, this.mmpService.selectNode())
            this.mapCacheService.updateCachedStatus()
        })

        this.mmpService.on('create').subscribe(() => {
            Object.assign(this.node, this.mmpService.selectNode())
            this.mapCacheService.updateCachedStatus()
        })

        this.mmpService.on('nodeCreate').subscribe(() => {
            this.mapCacheService.updateCachedStatus()
        })

        this.mmpService.on('nodeRemove').subscribe(() => {
            this.mapCacheService.updateCachedStatus()
        })
    }

}
