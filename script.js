// 布料统计管理系统 JavaScript
class FabricManager {
    constructor() {
        this.fabrics = [];
        this.outboundRecords = [];
        this.currentEditId = null;
        this.currentTab = 'inventory';
        this.init();
    }

    // 初始化
    init() {
        this.loadData();
        this.bindEvents();
        this.initTabs();
        this.updateDisplay();
        this.initMobileOptimizations();
    }

    // 绑定事件
    bindEvents() {
        // 表单提交
        document.getElementById('fabricForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addFabric();
        });

        // 出库表单提交
        document.getElementById('outboundForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processOutbound();
        });

        // 编辑表单提交
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateFabric();
        });

        // 搜索和筛选
        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterFabrics();
        });

        document.getElementById('filterType').addEventListener('change', () => {
            this.filterFabrics();
        });

        // 操作按钮
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearData();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // 出库相关事件
        document.getElementById('outboundFabric').addEventListener('change', () => {
            this.updateAvailableLength();
        });

        document.getElementById('exportOutboundBtn').addEventListener('click', () => {
            this.exportOutboundData();
        });

        document.getElementById('clearOutboundBtn').addEventListener('click', () => {
            this.clearOutboundData();
        });

        // 出库记录搜索和筛选
        document.getElementById('outboundSearchInput').addEventListener('input', () => {
            this.filterOutboundRecords();
        });

        document.getElementById('filterPurpose').addEventListener('change', () => {
            this.filterOutboundRecords();
        });

        document.getElementById('filterDate').addEventListener('change', () => {
            this.filterOutboundRecords();
        });

        // 模态框
        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.closeModal();
        });

        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('editModal')) {
                this.closeModal();
            }
        });
    }

    // 添加布料
    addFabric() {
        const formData = new FormData(document.getElementById('fabricForm'));
        const fabric = {
            id: Date.now().toString(),
            name: formData.get('fabricName'),
            type: formData.get('fabricType'),
            color: formData.get('fabricColor'),
            width: parseFloat(formData.get('fabricWidth')),
            length: parseFloat(formData.get('fabricLength')),
            remainingLength: parseFloat(formData.get('fabricLength')),
            price: parseFloat(formData.get('fabricPrice')),
            supplier: formData.get('fabricSupplier') || '',
            notes: formData.get('fabricNotes') || '',
            createdAt: new Date().toISOString()
        };

        // 验证数据
        if (!this.validateFabric(fabric)) {
            return;
        }

        this.fabrics.push(fabric);
        this.saveData();
        this.updateDisplay();
        this.resetForm();
        this.showAlert('布料添加成功！', 'success');
    }

    // 验证布料数据
    validateFabric(fabric) {
        if (!fabric.name.trim()) {
            this.showAlert('请输入布料名称', 'error');
            return false;
        }
        if (!fabric.type) {
            this.showAlert('请选择布料类型', 'error');
            return false;
        }
        if (!fabric.color.trim()) {
            this.showAlert('请输入颜色', 'error');
            return false;
        }
        if (fabric.width <= 0) {
            this.showAlert('幅宽必须大于0', 'error');
            return false;
        }
        if (fabric.length <= 0) {
            this.showAlert('长度必须大于0', 'error');
            return false;
        }
        if (fabric.price <= 0) {
            this.showAlert('单价必须大于0', 'error');
            return false;
        }
        return true;
    }

    // 编辑布料
    editFabric(id) {
        const fabric = this.fabrics.find(f => f.id === id);
        if (!fabric) return;

        this.currentEditId = id;
        
        // 填充编辑表单
        document.getElementById('editId').value = fabric.id;
        document.getElementById('editFabricName').value = fabric.name;
        document.getElementById('editFabricType').value = fabric.type;
        document.getElementById('editFabricColor').value = fabric.color;
        document.getElementById('editFabricWidth').value = fabric.width;
        document.getElementById('editFabricLength').value = fabric.length;
        document.getElementById('editFabricPrice').value = fabric.price;
        document.getElementById('editFabricSupplier').value = fabric.supplier;
        document.getElementById('editFabricNotes').value = fabric.notes;

        // 显示模态框
        document.getElementById('editModal').style.display = 'block';
    }

    // 更新布料
    updateFabric() {
        const formData = new FormData(document.getElementById('editForm'));
        const updatedFabric = {
            id: this.currentEditId,
            name: formData.get('fabricName'),
            type: formData.get('fabricType'),
            color: formData.get('fabricColor'),
            width: parseFloat(formData.get('fabricWidth')),
            length: parseFloat(formData.get('fabricLength')),
            price: parseFloat(formData.get('fabricPrice')),
            supplier: formData.get('fabricSupplier') || '',
            notes: formData.get('fabricNotes') || '',
            updatedAt: new Date().toISOString()
        };

        // 验证数据
        if (!this.validateFabric(updatedFabric)) {
            return;
        }

        const index = this.fabrics.findIndex(f => f.id === this.currentEditId);
        if (index !== -1) {
            // 保留创建时间
            updatedFabric.createdAt = this.fabrics[index].createdAt;
            this.fabrics[index] = updatedFabric;
            this.saveData();
            this.updateDisplay();
            this.closeModal();
            this.showAlert('布料信息更新成功！', 'success');
        }
    }

    // 删除布料
    deleteFabric(id) {
        if (confirm('确定要删除这个布料吗？')) {
            this.fabrics = this.fabrics.filter(f => f.id !== id);
            this.saveData();
            this.updateDisplay();
            this.showAlert('布料删除成功！', 'success');
        }
    }

    // 关闭模态框
    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.currentEditId = null;
    }

    // 重置表单
    resetForm() {
        document.getElementById('fabricForm').reset();
    }

    // 初始化标签
    initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
        this.updateOutboundFabricOptions();
    }

    // 切换标签
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // 更新按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // 显示对应内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}-tab`).style.display = 'block';
        
        // 显示对应的列表区域
        if (tabName === 'inventory') {
            document.querySelector('.fabric-list-section').style.display = 'block';
            document.getElementById('outbound-records').style.display = 'none';
        } else if (tabName === 'outbound') {
            document.querySelector('.fabric-list-section').style.display = 'none';
            document.getElementById('outbound-records').style.display = 'block';
            this.updateOutboundDisplay();
        }
    }

    // 更新显示
    updateDisplay() {
        this.updateStats();
        this.updateCategoryStats();
        this.updateFabricTable();
        
        // 更新出库相关显示
        this.updateOutboundFabricOptions();
        if (this.currentTab === 'outbound') {
            this.updateOutboundDisplay();
        }
    }

    // 更新统计数据
    updateStats() {
        const totalFabrics = this.fabrics.length;
        const totalLength = this.fabrics.reduce((sum, fabric) => sum + fabric.length, 0);
        const totalValue = this.fabrics.reduce((sum, fabric) => sum + (fabric.length * fabric.price), 0);
        const totalTypes = new Set(this.fabrics.map(f => f.type)).size;

        document.getElementById('totalFabrics').textContent = totalFabrics;
        document.getElementById('totalLength').textContent = totalLength.toFixed(2);
        document.getElementById('totalValue').textContent = `¥${totalValue.toFixed(2)}`;
        document.getElementById('totalTypes').textContent = totalTypes;
    }

    // 更新分类统计
    updateCategoryStats() {
        const categoryStats = {};
        
        this.fabrics.forEach(fabric => {
            if (!categoryStats[fabric.type]) {
                categoryStats[fabric.type] = {
                    count: 0,
                    length: 0,
                    value: 0
                };
            }
            categoryStats[fabric.type].count++;
            categoryStats[fabric.type].length += fabric.length;
            categoryStats[fabric.type].value += fabric.length * fabric.price;
        });

        const container = document.getElementById('categoryStats');
        container.innerHTML = '';

        if (Object.keys(categoryStats).length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #718096;">暂无数据</p>';
            return;
        }

        Object.entries(categoryStats).forEach(([type, stats]) => {
            const item = document.createElement('div');
            item.className = 'category-item';
            item.innerHTML = `
                <div>
                    <div class="category-name">${type}</div>
                    <div style="font-size: 0.8rem; color: #718096;">
                        ${stats.count}件 | ${stats.length.toFixed(2)}米
                    </div>
                </div>
                <div class="category-value">¥${stats.value.toFixed(2)}</div>
            `;
            container.appendChild(item);
        });
    }

    // 更新布料表格
    updateFabricTable() {
        const tbody = document.getElementById('fabricTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (this.fabrics.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        tbody.innerHTML = this.fabrics.map(fabric => `
            <tr>
                <td>${fabric.name}</td>
                <td>${fabric.type}</td>
                <td>${fabric.color}</td>
                <td>${fabric.width}</td>
                <td>${fabric.length}</td>
                <td>¥${fabric.price.toFixed(2)}</td>
                <td>¥${(fabric.length * fabric.price).toFixed(2)}</td>
                <td>${fabric.supplier}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="fabricManager.editFabric('${fabric.id}')">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="action-btn delete-btn" onclick="fabricManager.deleteFabric('${fabric.id}')">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // 筛选布料
    filterFabrics() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const filterType = document.getElementById('filterType').value;
        
        let filteredFabrics = this.fabrics;

        // 按搜索词筛选
        if (searchTerm) {
            filteredFabrics = filteredFabrics.filter(fabric => 
                fabric.name.toLowerCase().includes(searchTerm) ||
                fabric.color.toLowerCase().includes(searchTerm) ||
                fabric.supplier.toLowerCase().includes(searchTerm)
            );
        }

        // 按类型筛选
        if (filterType) {
            filteredFabrics = filteredFabrics.filter(fabric => fabric.type === filterType);
        }

        // 更新表格显示
        const tbody = document.getElementById('fabricTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (filteredFabrics.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <i class="fas fa-search"></i>
                <p>没有找到匹配的布料</p>
            `;
            return;
        }

        emptyState.style.display = 'none';
        
        tbody.innerHTML = filteredFabrics.map(fabric => `
            <tr>
                <td>${fabric.name}</td>
                <td>${fabric.type}</td>
                <td>${fabric.color}</td>
                <td>${fabric.width}</td>
                <td>${fabric.length}</td>
                <td>¥${fabric.price.toFixed(2)}</td>
                <td>¥${(fabric.length * fabric.price).toFixed(2)}</td>
                <td>${fabric.supplier}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="fabricManager.editFabric('${fabric.id}')">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="action-btn delete-btn" onclick="fabricManager.deleteFabric('${fabric.id}')">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // 保存数据到本地存储
    saveData() {
        try {
            localStorage.setItem('fabricData', JSON.stringify(this.fabrics));
            localStorage.setItem('outboundData', JSON.stringify(this.outboundRecords));
        } catch (error) {
            console.error('保存数据失败:', error);
            this.showAlert('保存数据失败', 'error');
        }
    }

    // 从本地存储加载数据
    loadData() {
        try {
            const data = localStorage.getItem('fabricData');
            if (data) {
                this.fabrics = JSON.parse(data);
                // 确保每个布料都有剩余长度
                this.fabrics.forEach(fabric => {
                    if (fabric.remainingLength === undefined) {
                        fabric.remainingLength = fabric.length;
                    }
                });
            }
            
            const outboundData = localStorage.getItem('outboundData');
            if (outboundData) {
                this.outboundRecords = JSON.parse(outboundData);
            }
            
            // 为旧数据添加remainingLength属性并重新保存
            if (this.fabrics.length > 0) {
                let needsSave = false;
                this.fabrics.forEach(fabric => {
                    if (fabric.remainingLength === undefined) {
                        fabric.remainingLength = fabric.length;
                        needsSave = true;
                    }
                });
                if (needsSave) {
                    this.saveData();
                }
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            this.fabrics = [];
            this.outboundRecords = [];
        }
    }

    // 导出数据
    exportData() {
        if (this.fabrics.length === 0) {
            this.showAlert('没有数据可导出', 'error');
            return;
        }

        try {
            // 创建CSV内容
            const headers = ['名称', '类型', '颜色', '幅宽(cm)', '长度(m)', '单价(元/米)', '总价值', '供应商', '备注', '创建时间'];
            const csvContent = [
                headers.join(','),
                ...this.fabrics.map(fabric => [
                    `"${fabric.name}"`,
                    `"${fabric.type}"`,
                    `"${fabric.color}"`,
                    fabric.width,
                    fabric.length,
                    fabric.price,
                    (fabric.length * fabric.price).toFixed(2),
                    `"${fabric.supplier}"`,
                    `"${fabric.notes}"`,
                    `"${new Date(fabric.createdAt).toLocaleString()}"`
                ].join(','))
            ].join('\n');

            // 创建并下载文件
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `布料统计_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showAlert('数据导出成功！', 'success');
        } catch (error) {
            console.error('导出失败:', error);
            this.showAlert('导出失败', 'error');
        }
    }

    // 导入数据
    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    if (confirm('导入数据将覆盖现有数据，确定继续吗？')) {
                        this.fabrics = data;
                        this.saveData();
                        this.updateDisplay();
                        this.showAlert('数据导入成功！', 'success');
                    }
                } else {
                    this.showAlert('文件格式不正确', 'error');
                }
            } catch (error) {
                console.error('导入失败:', error);
                this.showAlert('文件格式不正确', 'error');
            }
        };
        reader.readAsText(file);
    }

    // 清空数据
    clearData() {
        if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
            this.fabrics = [];
            this.saveData();
            this.updateDisplay();
            this.showAlert('数据已清空', 'success');
        }
    }

    // 显示提示信息
    showAlert(message, type = 'info') {
        // 移除现有的提示
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // 创建新提示
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        // 插入到页面顶部
        const container = document.querySelector('.container');
        container.insertBefore(alert, container.firstChild);

        // 3秒后自动移除
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }

    // 获取统计报告
    getStatisticsReport() {
        const totalFabrics = this.fabrics.length;
        const totalLength = this.fabrics.reduce((sum, fabric) => sum + fabric.length, 0);
        const totalValue = this.fabrics.reduce((sum, fabric) => sum + (fabric.length * fabric.price), 0);
        const avgPrice = totalLength > 0 ? totalValue / totalLength : 0;
        
        const typeStats = {};
        this.fabrics.forEach(fabric => {
            if (!typeStats[fabric.type]) {
                typeStats[fabric.type] = { count: 0, length: 0, value: 0 };
            }
            typeStats[fabric.type].count++;
            typeStats[fabric.type].length += fabric.length;
            typeStats[fabric.type].value += fabric.length * fabric.price;
        });

        return {
            totalFabrics,
            totalLength: totalLength.toFixed(2),
            totalValue: totalValue.toFixed(2),
            avgPrice: avgPrice.toFixed(2),
            typeStats
        };
    }

    // ========== 出库系统方法 ==========

    // 更新出库布料选项
    updateOutboundFabricOptions() {
        const select = document.getElementById('outboundFabric');
        const availableFabrics = this.fabrics.filter(fabric => fabric.remainingLength > 0);
        
        select.innerHTML = '<option value="">请选择要出库的布料</option>';
        
        availableFabrics.forEach(fabric => {
            const option = document.createElement('option');
            option.value = fabric.id;
            option.textContent = `${fabric.name} (${fabric.type}, ${fabric.color}) - 剩余: ${fabric.remainingLength.toFixed(2)}m`;
            select.appendChild(option);
        });
    }

    // 更新可用长度显示
    updateAvailableLength() {
        const fabricId = document.getElementById('outboundFabric').value;
        const availableLengthInput = document.getElementById('availableLength');
        
        if (fabricId) {
            const fabric = this.fabrics.find(f => f.id === fabricId);
            if (fabric) {
                availableLengthInput.value = fabric.remainingLength.toFixed(2);
            }
        } else {
            availableLengthInput.value = '';
        }
    }

    // 处理出库
    processOutbound() {
        const formData = new FormData(document.getElementById('outboundForm'));
        const fabricId = formData.get('outboundFabric');
        const outboundLength = parseFloat(formData.get('outboundLength'));
        const purpose = formData.get('outboundPurpose');
        const operator = formData.get('outboundOperator');
        const notes = formData.get('outboundNotes') || '';
        
        // 验证数据
        if (!fabricId || !outboundLength || !purpose || !operator) {
            this.showAlert('请填写所有必填字段', 'error');
            return;
        }
        
        const fabric = this.fabrics.find(f => f.id === fabricId);
        if (!fabric) {
            this.showAlert('选择的布料不存在', 'error');
            return;
        }
        
        if (outboundLength > fabric.remainingLength) {
            this.showAlert(`出库长度不能超过剩余长度 ${fabric.remainingLength.toFixed(2)}m`, 'error');
            return;
        }
        
        if (outboundLength <= 0) {
            this.showAlert('出库长度必须大于0', 'error');
            return;
        }
        
        // 创建出库记录
        const outboundRecord = {
            id: Date.now().toString(),
            fabricId: fabricId,
            fabricName: fabric.name,
            fabricType: fabric.type,
            fabricColor: fabric.color,
            outboundLength: outboundLength,
            unitPrice: fabric.price,
            totalValue: outboundLength * fabric.price,
            purpose: purpose,
            operator: operator,
            notes: notes,
            outboundDate: new Date().toISOString()
        };
        
        // 更新库存
        fabric.remainingLength -= outboundLength;
        
        // 添加出库记录
        this.outboundRecords.push(outboundRecord);
        
        // 保存数据
        this.saveData();
        
        // 更新显示
        this.updateDisplay();
        
        // 重置表单
        document.getElementById('outboundForm').reset();
        document.getElementById('availableLength').value = '';
        
        this.showAlert('出库成功！', 'success');
    }

    // 更新出库显示
    updateOutboundDisplay() {
        this.updateOutboundStats();
        this.updatePurposeStats();
        this.updateOutboundTable();
    }

    // 更新出库统计
    updateOutboundStats() {
        const totalOutbounds = this.outboundRecords.length;
        const totalOutboundLength = this.outboundRecords.reduce((sum, record) => sum + record.outboundLength, 0);
        const totalOutboundValue = this.outboundRecords.reduce((sum, record) => sum + record.totalValue, 0);
        
        // 今日出库
        const today = new Date().toDateString();
        const todayOutbounds = this.outboundRecords.filter(record => 
            new Date(record.outboundDate).toDateString() === today
        ).length;
        
        document.getElementById('totalOutbounds').textContent = totalOutbounds;
        document.getElementById('totalOutboundLength').textContent = totalOutboundLength.toFixed(2);
        document.getElementById('totalOutboundValue').textContent = `¥${totalOutboundValue.toFixed(2)}`;
        document.getElementById('todayOutbounds').textContent = todayOutbounds;
    }

    // 更新用途统计
    updatePurposeStats() {
        const purposeStats = {};
        
        this.outboundRecords.forEach(record => {
            if (!purposeStats[record.purpose]) {
                purposeStats[record.purpose] = {
                    count: 0,
                    length: 0,
                    value: 0
                };
            }
            purposeStats[record.purpose].count++;
            purposeStats[record.purpose].length += record.outboundLength;
            purposeStats[record.purpose].value += record.totalValue;
        });
        
        const container = document.getElementById('purposeStats');
        container.innerHTML = '';
        
        if (Object.keys(purposeStats).length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #718096;">暂无数据</p>';
            return;
        }
        
        Object.entries(purposeStats).forEach(([purpose, stats]) => {
            const item = document.createElement('div');
            item.className = 'category-item';
            item.innerHTML = `
                <div>
                    <div class="category-name">${purpose}</div>
                    <div style="font-size: 0.8rem; color: #718096;">
                        ${stats.count}次 | ${stats.length.toFixed(2)}米
                    </div>
                </div>
                <div class="category-value">¥${stats.value.toFixed(2)}</div>
            `;
            container.appendChild(item);
        });
    }

    // 更新出库记录表格
    updateOutboundTable() {
        const tbody = document.getElementById('outboundTableBody');
        const emptyState = document.getElementById('outboundEmptyState');
        
        if (this.outboundRecords.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        // 按时间倒序排列
        const sortedRecords = [...this.outboundRecords].sort((a, b) => 
            new Date(b.outboundDate) - new Date(a.outboundDate)
        );
        
        tbody.innerHTML = sortedRecords.map(record => {
            const date = new Date(record.outboundDate);
            const formattedDate = date.toLocaleString('zh-CN');
            
            return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${record.fabricName}</td>
                    <td>${record.fabricType}</td>
                    <td>${record.fabricColor}</td>
                    <td>${record.outboundLength.toFixed(2)}</td>
                    <td>¥${record.unitPrice.toFixed(2)}</td>
                    <td>¥${record.totalValue.toFixed(2)}</td>
                    <td>${record.purpose}</td>
                    <td>${record.operator}</td>
                    <td>${record.notes}</td>
                </tr>
            `;
        }).join('');
    }

    // 筛选出库记录
    filterOutboundRecords() {
        const searchTerm = document.getElementById('outboundSearchInput').value.toLowerCase();
        const filterPurpose = document.getElementById('filterPurpose').value;
        const filterDate = document.getElementById('filterDate').value;
        
        let filteredRecords = this.outboundRecords;
        
        // 按搜索词筛选
        if (searchTerm) {
            filteredRecords = filteredRecords.filter(record => 
                record.fabricName.toLowerCase().includes(searchTerm) ||
                record.operator.toLowerCase().includes(searchTerm) ||
                record.notes.toLowerCase().includes(searchTerm)
            );
        }
        
        // 按用途筛选
        if (filterPurpose) {
            filteredRecords = filteredRecords.filter(record => record.purpose === filterPurpose);
        }
        
        // 按日期筛选
        if (filterDate) {
            filteredRecords = filteredRecords.filter(record => {
                const recordDate = new Date(record.outboundDate).toDateString();
                const selectedDate = new Date(filterDate).toDateString();
                return recordDate === selectedDate;
            });
        }
        
        // 更新表格显示
        const tbody = document.getElementById('outboundTableBody');
        const emptyState = document.getElementById('outboundEmptyState');
        
        if (filteredRecords.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <i class="fas fa-search"></i>
                <p>没有找到匹配的出库记录</p>
            `;
            return;
        }
        
        emptyState.style.display = 'none';
        
        // 按时间倒序排列
        const sortedRecords = [...filteredRecords].sort((a, b) => 
            new Date(b.outboundDate) - new Date(a.outboundDate)
        );
        
        tbody.innerHTML = sortedRecords.map(record => {
            const date = new Date(record.outboundDate);
            const formattedDate = date.toLocaleString('zh-CN');
            
            return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${record.fabricName}</td>
                    <td>${record.fabricType}</td>
                    <td>${record.fabricColor}</td>
                    <td>${record.outboundLength.toFixed(2)}</td>
                    <td>¥${record.unitPrice.toFixed(2)}</td>
                    <td>¥${record.totalValue.toFixed(2)}</td>
                    <td>${record.purpose}</td>
                    <td>${record.operator}</td>
                    <td>${record.notes}</td>
                </tr>
            `;
        }).join('');
    }

    // 导出出库数据
    exportOutboundData() {
        if (this.outboundRecords.length === 0) {
            this.showAlert('没有出库记录可导出', 'error');
            return;
        }
        
        const headers = ['出库时间', '布料名称', '类型', '颜色', '出库长度(m)', '单价(元/米)', '出库价值', '用途', '操作员', '备注'];
        const csvContent = [headers.join(',')];
        
        this.outboundRecords.forEach(record => {
            const row = [
                new Date(record.outboundDate).toLocaleString('zh-CN'),
                record.fabricName,
                record.fabricType,
                record.fabricColor,
                record.outboundLength.toFixed(2),
                record.unitPrice.toFixed(2),
                record.totalValue.toFixed(2),
                record.purpose,
                record.operator,
                record.notes
            ];
            csvContent.push(row.join(','));
        });
        
        const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `出库记录_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showAlert('出库记录导出成功！', 'success');
    }

    // 清空出库数据
    clearOutboundData() {
        if (this.outboundRecords.length === 0) {
            this.showAlert('没有出库记录可清空', 'error');
            return;
        }
        
        if (confirm('确定要清空所有出库记录吗？此操作不可恢复！')) {
            // 恢复所有布料的剩余长度
            this.outboundRecords.forEach(record => {
                const fabric = this.fabrics.find(f => f.id === record.fabricId);
                if (fabric) {
                    fabric.remainingLength += record.outboundLength;
                }
            });
            
            this.outboundRecords = [];
            this.saveData();
            this.updateDisplay();
            this.showAlert('出库记录已清空，库存已恢复！', 'success');
        }
    }

    // ========== 移动端优化方法 ==========

    // 初始化移动端优化
    initMobileOptimizations() {
        this.initTableScrollIndicator();
        this.initTouchFeedback();
    }

    // 初始化表格滚动指示器
    initTableScrollIndicator() {
        const tableContainers = document.querySelectorAll('.table-container');
        
        tableContainers.forEach(container => {
            container.addEventListener('scroll', () => {
                if (container.scrollLeft > 0) {
                    container.classList.add('scrolled');
                } else {
                    container.classList.remove('scrolled');
                }
            });
        });
    }

    // 初始化触摸反馈
    initTouchFeedback() {
        // 为所有按钮添加触摸反馈
        const buttons = document.querySelectorAll('.btn, .tab-btn');
        
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('touchend', () => {
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);
            });
            
            button.addEventListener('touchcancel', () => {
                button.style.transform = '';
            });
        });
    }
}

// 网络状态检测和性能优化
class NetworkOptimizer {
    constructor() {
        this.isOnline = navigator.onLine;
        this.connectionType = this.getConnectionType();
        this.initNetworkMonitoring();
        this.initPerformanceOptimizations();
    }
    
    getConnectionType() {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType || 'unknown';
        }
        return 'unknown';
    }
    
    initNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNetworkStatus('网络已连接', 'success');
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNetworkStatus('网络已断开，应用将在离线模式下运行', 'warning');
        });
        
        // 监听网络变化
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.connectionType = this.getConnectionType();
                this.optimizeForConnection();
            });
        }
    }
    
    initPerformanceOptimizations() {
        // 预加载关键资源
        this.preloadCriticalResources();
        
        // 图片懒加载（如果有的话）
        this.initLazyLoading();
        
        // 防抖优化
        this.initDebounceOptimizations();
    }
    
    preloadCriticalResources() {
        // 预加载字体和关键CSS
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        link.as = 'style';
        document.head.appendChild(link);
    }
    
    initLazyLoading() {
        // 为未来的图片元素准备懒加载
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });
            
            // 观察所有带有data-src的图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    initDebounceOptimizations() {
        // 为搜索输入添加防抖
        const searchInputs = document.querySelectorAll('#searchInput, #outboundSearchInput');
        searchInputs.forEach(input => {
            let timeout;
            const originalHandler = input.oninput;
            input.oninput = (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (originalHandler) originalHandler.call(input, e);
                }, 300);
            };
        });
    }
    
    optimizeForConnection() {
        // 根据网络状况调整功能
        if (this.connectionType === 'slow-2g' || this.connectionType === '2g') {
            // 低速网络优化
            this.enableLowBandwidthMode();
        } else {
            this.disableLowBandwidthMode();
        }
    }
    
    enableLowBandwidthMode() {
        // 减少动画和过渡效果
        document.body.classList.add('low-bandwidth');
        
        // 添加低带宽模式的CSS
        if (!document.getElementById('low-bandwidth-styles')) {
            const style = document.createElement('style');
            style.id = 'low-bandwidth-styles';
            style.textContent = `
                .low-bandwidth * {
                    transition: none !important;
                    animation: none !important;
                }
                .low-bandwidth .btn:hover {
                    transform: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    disableLowBandwidthMode() {
        document.body.classList.remove('low-bandwidth');
    }
    
    showNetworkStatus(message, type) {
        // 显示网络状态提示
        const existingAlert = document.querySelector('.network-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alert = document.createElement('div');
        alert.className = `network-alert alert alert-${type}`;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#FF9800'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }
    
    syncOfflineData() {
        // 同步离线期间的数据变更
        if (this.isOnline && fabricManager) {
            fabricManager.saveData();
        }
    }
}

// 初始化应用
let fabricManager;
let networkOptimizer;

document.addEventListener('DOMContentLoaded', () => {
    fabricManager = new FabricManager();
    networkOptimizer = new NetworkOptimizer();
});

// 导出到全局作用域，供HTML中的onclick使用
window.fabricManager = fabricManager;
window.networkOptimizer = networkOptimizer;